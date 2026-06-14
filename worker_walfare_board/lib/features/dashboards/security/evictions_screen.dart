import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/format.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Evictions / illegal occupants. Mirrors the website's EvictionsDashboard:
/// track illegal occupants, court cases, and mark flats vacated.
class EvictionsScreen extends StatefulWidget {
  const EvictionsScreen({super.key});

  @override
  State<EvictionsScreen> createState() => _EvictionsScreenState();
}

class _EvictionsScreenState extends State<EvictionsScreen> {
  static const _statuses = [
    'illegal_identified',
    'notice_served',
    'case_filed',
    'hearing_pending',
    'order_received',
    'police_scheduled',
    'vacated',
    'closed',
    'stayed',
  ];

  final _repo = ApiRepository.instance;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _cases = const [];
  List<Map<String, dynamic>> _colonies = const [];
  List<Map<String, dynamic>> _flats = const [];
  List<Map<String, dynamic>> _assignments = const [];
  List<Map<String, dynamic>> _workers = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final r = await Future.wait([_repo.evictionCases(), _repo.colonies(), _repo.flats(), _repo.flatAssignments(), _repo.workers()]);
      setState(() {
        _cases = r[0];
        _colonies = r[1];
        _flats = r[2];
        _assignments = r[3];
        _workers = r[4];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  String _colonyName(int? id) {
    final c = _colonies.cast<Map<String, dynamic>?>().firstWhere((x) => asIntN(x?['id']) == id, orElse: () => null);
    return c == null ? '-' : asStr(c['name'], 'Colony #$id');
  }

  Future<void> _addCase() async {
    final data = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _CaseSheet(colonies: _colonies, flats: _flats, assignments: _assignments, workers: _workers, statuses: _statuses),
    );
    if (data == null) return;
    try {
      await _repo.createEvictionCase(data);
      if (!mounted) return;
      showToast(context, 'Illegal occupant case ban gaya.', success: true);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }

  Future<void> _updateStatus(Map<String, dynamic> item, String status) async {
    try {
      await _repo.updateEvictionCase(asInt(item['id']), {
        'status': status,
        if (status == 'vacated') 'vacant_date': DateTime.now().toIso8601String().substring(0, 10),
      });
      if (!mounted) return;
      showToast(context, status == 'vacated' ? 'Flat vacant mark ho gaya.' : 'Case status update ho gaya.', success: true);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
          const SizedBox(height: 12),
          FilledButton.icon(onPressed: _load, icon: const Icon(Icons.refresh), label: const Text('Retry')),
        ]),
      );
    }

    final active = _cases.where((c) => !['vacated', 'closed'].contains(asStr(c['status']))).length;
    final courtPending = _cases.where((c) => ['case_filed', 'hearing_pending', 'order_received', 'stayed'].contains(asStr(c['status']))).length;
    final vacated = _cases.where((c) => asStr(c['status']) == 'vacated').length;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          MetricGrid(children: [
            MetricCard(title: 'Illegal Occupants', value: '$active', tone: MetricTone.red, icon: Icons.gavel_outlined),
            MetricCard(title: 'Court Pending', value: '$courtPending', tone: MetricTone.amber, icon: Icons.balance_outlined),
            MetricCard(title: 'Vacated', value: '$vacated', tone: MetricTone.green, icon: Icons.check_circle_outline),
            MetricCard(title: 'Total Cases', value: '${_cases.length}', tone: MetricTone.purple, icon: Icons.folder_outlined),
          ]),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Illegal Occupants & Evictions',
            subtitle: '${_cases.length} cases',
            trailing: FilledButton(
              onPressed: _addCase,
              style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), minimumSize: Size.zero),
              child: const Text('Add Case'),
            ),
            child: _cases.isEmpty
                ? const EmptyHint('No eviction cases found.')
                : Column(children: _cases.map(_caseTile).toList()),
          ),
        ],
      ),
    );
  }

  Widget _caseTile(Map<String, dynamic> item) {
    final status = asStr(item['status']);
    final done = ['vacated', 'closed'].contains(status);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.surfaceMuted, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(asStr(item['occupant_name'], 'Case #${asStr(item['id'])}'), style: const TextStyle(fontWeight: FontWeight.bold))),
              StatusPill(status),
            ],
          ),
          const SizedBox(height: 2),
          Text('${asStr(item['occupant_cnic'], 'CNIC N/A')} · ${_colonyName(asIntN(item['colony_id']))}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          if (asStrN(item['case_no']) != null)
            Text('Case: ${asStr(item['case_no'])} · ${asStr(item['court_name'], 'Court N/A')}', style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
          if (asStrN(item['next_hearing_date']) != null)
            Text('Next hearing: ${shortDate(item['next_hearing_date'])}', style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
          if (!done) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () => _updateStatus(item, 'police_scheduled'),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), minimumSize: Size.zero),
                  child: const Text('Police'),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: () => _updateStatus(item, 'vacated'),
                  style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), minimumSize: Size.zero, backgroundColor: AppColors.success),
                  child: const Text('Vacant'),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

// ── Add case sheet ─────────────────────────────────────────────────────────────

class _CaseSheet extends StatefulWidget {
  const _CaseSheet({required this.colonies, required this.flats, required this.assignments, required this.workers, required this.statuses});
  final List<Map<String, dynamic>> colonies;
  final List<Map<String, dynamic>> flats;
  final List<Map<String, dynamic>> assignments;
  final List<Map<String, dynamic>> workers;
  final List<String> statuses;

  @override
  State<_CaseSheet> createState() => _CaseSheetState();
}

class _CaseSheetState extends State<_CaseSheet> {
  final _name = TextEditingController();
  final _cnic = TextEditingController();
  final _phone = TextEditingController();
  final _caseNo = TextEditingController();
  final _court = TextEditingController();
  final _reason = TextEditingController();
  int? _colonyId;
  int? _flatId;
  int? _workerId;
  String _status = 'illegal_identified';

  // Select a flat → auto-fill the registered worker (active assignment).
  void _onSelectFlat(int? flatId) {
    Map<String, dynamic>? worker;
    if (flatId != null) {
      final assignment = widget.assignments.cast<Map<String, dynamic>?>().firstWhere(
            (a) => asIntN(a?['flat_id']) == flatId && asStr(a?['status'], 'active') == 'active',
            orElse: () => null,
          );
      final wid = asIntN(assignment?['worker_id']);
      if (wid != null) {
        worker = widget.workers.cast<Map<String, dynamic>?>().firstWhere((w) => asIntN(w?['id']) == wid, orElse: () => null);
      }
    }
    setState(() {
      _flatId = flatId;
      _workerId = asIntN(worker?['id']);
      _name.text = asStr(worker?['name']);
      _cnic.text = asStr(worker?['cnic']);
      _phone.text = asStr(worker?['mobile_no_1']);
    });
  }

  @override
  void dispose() {
    _name.dispose();
    _cnic.dispose();
    _phone.dispose();
    _caseNo.dispose();
    _court.dispose();
    _reason.dispose();
    super.dispose();
  }

  void _submit() {
    if (_name.text.trim().isEmpty) {
      showToast(context, 'Occupant name required.', error: true);
      return;
    }
    Navigator.pop(context, {
      'occupant_name': _name.text.trim(),
      if (_cnic.text.trim().isNotEmpty) 'occupant_cnic': _cnic.text.trim(),
      if (_phone.text.trim().isNotEmpty) 'occupant_phone': _phone.text.trim(),
      if (_colonyId != null) 'colony_id': _colonyId,
      if (_flatId != null) 'flat_id': _flatId,
      if (_workerId != null) 'worker_id': _workerId,
      if (_caseNo.text.trim().isNotEmpty) 'case_no': _caseNo.text.trim(),
      if (_court.text.trim().isNotEmpty) 'court_name': _court.text.trim(),
      'status': _status,
      if (_reason.text.trim().isNotEmpty) 'illegal_reason': _reason.text.trim(),
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SingleChildScrollView(
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Add Illegal Occupant Case', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              TextField(controller: _name, decoration: const InputDecoration(labelText: 'Occupant Name *', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: _cnic, decoration: const InputDecoration(labelText: 'CNIC', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                initialValue: _colonyId,
                isExpanded: true,
                decoration: const InputDecoration(labelText: 'Colony', border: OutlineInputBorder()),
                items: widget.colonies.map((c) => DropdownMenuItem(value: asInt(c['id']), child: Text(asStr(c['name'], 'Colony #${asStr(c['id'])}')))).toList(),
                onChanged: (v) {
                  setState(() {
                    _colonyId = v;
                    _flatId = null;
                  });
                  _onSelectFlat(null);
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                initialValue: _flatId,
                isExpanded: true,
                decoration: InputDecoration(labelText: _colonyId == null ? 'Pehle colony chunein' : 'Flat (occupant auto-fill)', border: const OutlineInputBorder()),
                items: widget.flats
                    .where((f) => _colonyId == null || asIntN(f['colony_id']) == _colonyId)
                    .map((f) {
                  final occupied = widget.assignments.any((a) => asIntN(a['flat_id']) == asIntN(f['id']) && asStr(a['status'], 'active') == 'active');
                  return DropdownMenuItem(value: asInt(f['id']), child: Text('${asStr(f['flat_no'])} - ${asStr(f['flat_address'])}${occupied ? ' (occupied)' : ' (empty)'}', overflow: TextOverflow.ellipsis));
                }).toList(),
                onChanged: _colonyId == null ? null : _onSelectFlat,
              ),
              const SizedBox(height: 12),
              TextField(controller: _caseNo, decoration: const InputDecoration(labelText: 'Court Case No', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: _court, decoration: const InputDecoration(labelText: 'Court Name', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _status,
                decoration: const InputDecoration(labelText: 'Status', border: OutlineInputBorder()),
                items: widget.statuses.map((s) => DropdownMenuItem(value: s, child: Text(statusLabel(s)))).toList(),
                onChanged: (v) => setState(() => _status = v ?? 'illegal_identified'),
              ),
              const SizedBox(height: 12),
              TextField(controller: _reason, maxLines: 2, decoration: const InputDecoration(labelText: 'Illegal Occupancy Reason', border: OutlineInputBorder())),
              const SizedBox(height: 16),
              FilledButton(onPressed: _submit, child: const Text('Save Case')),
            ],
          ),
        ),
      ),
    );
  }
}
