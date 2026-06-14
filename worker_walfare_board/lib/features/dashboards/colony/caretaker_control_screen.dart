import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/models/domain_models.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Colony admin "Caretaker Control". Mirrors the website's CaretakerAdminDashboard:
/// create maintenance tasks for caretakers and monitor task progress.
class CaretakerControlScreen extends StatefulWidget {
  const CaretakerControlScreen({super.key});

  @override
  State<CaretakerControlScreen> createState() => _CaretakerControlScreenState();
}

class _CaretakerControlScreenState extends State<CaretakerControlScreen> {
  final _repo = ApiRepository.instance;

  bool _loading = true;
  String? _error;
  List<CaretakerTask> _tasks = const [];
  List<Map<String, dynamic>> _users = const [];
  List<Map<String, dynamic>> _assets = const [];
  List<Map<String, dynamic>> _flats = const [];
  List<Complaint> _complaints = const [];

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
      final r = await Future.wait([
        _repo.caretakerTasks(),
        _repo.users(),
        _repo.assets(),
        _repo.flats(),
        _repo.complaints(),
      ]);
      setState(() {
        _tasks = r[0].map((e) => CaretakerTask(e)).toList();
        _users = r[1];
        _assets = r[2];
        _flats = r[3];
        _complaints = r[4].map((e) => Complaint(e)).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _caretakers => _users.where((u) => asStr(u['role']) == 'care_taker_labour_colony').toList();

  String _caretakerName(int? id) {
    final u = _users.cast<Map<String, dynamic>?>().firstWhere((x) => asIntN(x?['id']) == id, orElse: () => null);
    return u == null ? 'Unassigned' : asStr(u['name']);
  }

  Future<void> _createTask() async {
    if (_caretakers.isEmpty) {
      showToast(context, 'Koi caretaker available nahi.', error: true);
      return;
    }
    final data = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _CreateTaskSheet(caretakers: _caretakers, assets: _assets, flats: _flats),
    );
    if (data == null) return;
    try {
      await _repo.createTask(data);
      if (!mounted) return;
      showToast(context, 'Maintenance task ban gaya.', success: true);
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

    final activeTasks = _tasks.where((t) => !['completed', 'cancelled', 'rejected'].contains(t.status)).length;
    final openComplaints = _complaints.where((c) => !['resolved', 'closed'].contains(c.status)).length;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          MetricGrid(children: [
            MetricCard(title: 'Open Complaints', value: '$openComplaints', tone: MetricTone.red, icon: Icons.support_agent_outlined),
            MetricCard(title: 'Active Tasks', value: '$activeTasks', tone: MetricTone.amber, icon: Icons.engineering_outlined),
            MetricCard(title: 'Caretakers', value: '${_caretakers.length}', tone: MetricTone.green, icon: Icons.groups_2_outlined),
            MetricCard(title: 'Total Tasks', value: '${_tasks.length}', tone: MetricTone.purple, icon: Icons.assignment_outlined),
          ]),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Caretaker Admin Control',
            subtitle: 'Maintenance tasks banayein aur monitor karein.',
            trailing: FilledButton(
              onPressed: _createTask,
              style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), minimumSize: Size.zero),
              child: const Text('Create Task'),
            ),
            child: const SizedBox.shrink(),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Task Monitor',
            subtitle: 'Assigned caretaker tasks',
            child: _tasks.isEmpty
                ? const EmptyHint('No tasks found.')
                : Column(
                    children: _tasks.map((t) {
                      final hasTarget = t.targetLatitude != null && t.targetLongitude != null;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceMuted,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(child: Text(t.title, style: const TextStyle(fontWeight: FontWeight.bold))),
                                StatusPill(t.status),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text('Caretaker: ${_caretakerName(t.assignedToUserId)}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                            if (hasTarget)
                              Text('Target: ${t.targetLatitude!.toStringAsFixed(5)}, ${t.targetLongitude!.toStringAsFixed(5)} · ${t.allowedRadiusMeters}m',
                                  style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }
}

// ── Create task sheet ──────────────────────────────────────────────────────────

class _CreateTaskSheet extends StatefulWidget {
  const _CreateTaskSheet({required this.caretakers, required this.assets, required this.flats});
  final List<Map<String, dynamic>> caretakers;
  final List<Map<String, dynamic>> assets;
  final List<Map<String, dynamic>> flats;

  @override
  State<_CreateTaskSheet> createState() => _CreateTaskSheetState();
}

class _CreateTaskSheetState extends State<_CreateTaskSheet> {
  int? _caretaker;
  int? _assetId;
  int? _flatId;
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final _radius = TextEditingController(text: '100');

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    _radius.dispose();
    super.dispose();
  }

  void _submit() {
    if (_caretaker == null) {
      showToast(context, 'Caretaker select karein.', error: true);
      return;
    }
    if (_title.text.trim().isEmpty) {
      showToast(context, 'Task title required.', error: true);
      return;
    }
    // Auto-fill target location from the selected asset/flat if available.
    double? lat, lng;
    if (_assetId != null) {
      final a = widget.assets.firstWhere((x) => asInt(x['id']) == _assetId, orElse: () => {});
      lat = asDoubleN(a['latitude']);
      lng = asDoubleN(a['longitude']);
    }
    if ((lat == null || lng == null) && _flatId != null) {
      final f = widget.flats.firstWhere((x) => asInt(x['id']) == _flatId, orElse: () => {});
      lat = asDoubleN(f['latitude']);
      lng = asDoubleN(f['longitude']);
    }
    Navigator.pop(context, {
      'assigned_to_user_id': _caretaker,
      if (_assetId != null) 'asset_id': _assetId,
      if (_flatId != null) 'flat_id': _flatId,
      'task_title': _title.text.trim(),
      if (_desc.text.trim().isNotEmpty) 'task_description': _desc.text.trim(),
      if (lat != null) 'target_latitude': lat,
      if (lng != null) 'target_longitude': lng,
      'allowed_radius_meters': int.tryParse(_radius.text.trim()) ?? 100,
      'status': 'assigned',
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
              Text('Create Maintenance Task', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              DropdownButtonFormField<int>(
                initialValue: _caretaker,
                isExpanded: true,
                decoration: const InputDecoration(labelText: 'Caretaker *', border: OutlineInputBorder()),
                items: widget.caretakers.map((u) => DropdownMenuItem(value: asInt(u['id']), child: Text(asStr(u['name'])))).toList(),
                onChanged: (v) => setState(() => _caretaker = v),
              ),
              const SizedBox(height: 12),
              TextField(controller: _title, decoration: const InputDecoration(labelText: 'Task Title *', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: _desc, maxLines: 2, decoration: const InputDecoration(labelText: 'Task Details', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                initialValue: _assetId,
                isExpanded: true,
                decoration: const InputDecoration(labelText: 'Linked Asset (optional)', border: OutlineInputBorder()),
                items: [
                  const DropdownMenuItem(value: null, child: Text('No linked asset')),
                  ...widget.assets.map((a) => DropdownMenuItem(value: asInt(a['id']), child: Text(asStr(a['name'], 'Asset ${asStr(a['id'])}')))),
                ],
                onChanged: (v) => setState(() => _assetId = v),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                initialValue: _flatId,
                isExpanded: true,
                decoration: const InputDecoration(labelText: 'Linked Flat (optional)', border: OutlineInputBorder()),
                items: [
                  const DropdownMenuItem(value: null, child: Text('No linked flat')),
                  ...widget.flats.map((f) => DropdownMenuItem(value: asInt(f['id']), child: Text('${asStr(f['flat_no'])} - ${asStr(f['flat_address'])}'))),
                ],
                onChanged: (v) => setState(() => _flatId = v),
              ),
              const SizedBox(height: 12),
              TextField(controller: _radius, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Allowed Radius (meters)', border: OutlineInputBorder())),
              const SizedBox(height: 16),
              FilledButton(onPressed: _submit, child: const Text('Create Task')),
            ],
          ),
        ),
      ),
    );
  }
}
