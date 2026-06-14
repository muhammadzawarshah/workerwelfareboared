import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/models/domain_models.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Verification desk. Mirrors the website's VerificationDesk: review each
/// worker application's required documents, approve/reject them, then move the
/// application to committee once all required docs are approved.
class VerificationDeskScreen extends StatefulWidget {
  const VerificationDeskScreen({super.key});

  @override
  State<VerificationDeskScreen> createState() => _VerificationDeskScreenState();
}

class _VerificationDeskScreenState extends State<VerificationDeskScreen> {
  static const _requiredGroups = <List<String>>[
    ['CNIC', 'cnic'],
    ['Domicile', 'domicile'],
    ['ESSI Verification', 'essi'],
    ['EOBI Verification', 'eobi'],
    ['Appointment Letter', 'appointment'],
    ['Salary Proof', 'salary'],
  ];

  final _repo = ApiRepository.instance;
  bool _loading = true;
  String? _error;
  List<Application> _apps = const [];
  Map<int, Worker> _workers = const {};
  List<Map<String, dynamic>> _documents = const [];
  List<Map<String, dynamic>> _docTypes = const [];
  int? _selectedId;

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
      final r = await Future.wait([_repo.applications(), _repo.workers(), _repo.documents(), _repo.documentTypes()]);
      setState(() {
        _apps = (r[0]).map((e) => Application(e)).toList();
        _workers = {for (final w in (r[1]).map((e) => Worker(e))) w.id: w};
        _documents = r[2];
        _docTypes = r[3];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> _docsFor(int appId, List<String> terms) {
    return _documents.where((d) {
      if (asIntN(d['application_id']) != appId) return false;
      final type = _docTypes.cast<Map<String, dynamic>?>().firstWhere((t) => asIntN(t?['id']) == asIntN(d['document_type_id']), orElse: () => null);
      final hay = '${asStr(type?['name'])} ${asStr(type?['code'])} ${asStr(d['original_file_name'])}'.toLowerCase();
      return terms.any((term) => hay.contains(term));
    }).toList();
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

    final reviewApps = _apps.where((a) => !['draft', 'cancelled', 'closed'].contains(a.status)).toList();
    final selected = _selectedId == null ? null : reviewApps.cast<Application?>().firstWhere((a) => a?.id == _selectedId, orElse: () => null);

    if (selected != null) return _detail(selected);

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: 'Workers Verification',
            subtitle: 'Select a worker to review documents',
            child: reviewApps.isEmpty
                ? const EmptyHint('No worker applications to review.')
                : Column(
                    children: reviewApps.map((a) {
                      final w = _workers[a.workerId];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(color: AppColors.surfaceMuted, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                        child: ListTile(
                          title: Text(w?.name ?? 'Worker #${a.workerId}', style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text('#${a.applicationNo} · ${w?.cnic ?? 'CNIC N/A'}', style: const TextStyle(fontSize: 12)),
                          trailing: Row(mainAxisSize: MainAxisSize.min, children: [StatusPill(a.status), const SizedBox(width: 6), const Icon(Icons.chevron_right)]),
                          onTap: () => setState(() => _selectedId = a.id),
                        ),
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _detail(Application app) {
    final w = _workers[app.workerId];
    final checks = _requiredGroups.map((g) {
      final docs = _docsFor(app.id, [g[1]]);
      final approved = docs.any((d) => asStr(d['status']) == 'approved');
      return (label: g[0], docs: docs, approved: approved);
    }).toList();
    final allApproved = checks.every((c) => c.approved);
    final moved = ['verified', 'committee_pending', 'approved', 'flat_assigned'].contains(app.status);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            IconButton(onPressed: () => setState(() => _selectedId = null), icon: const Icon(Icons.arrow_back)),
            const Text('Back to list', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
        SectionCard(
          title: 'Worker Details',
          subtitle: 'Application #${app.applicationNo}',
          trailing: StatusPill(app.status),
          child: Column(
            children: [
              _kv('Name', w?.name ?? 'Worker #${app.workerId}'),
              _kv('Father Name', w?.fatherName ?? 'N/A'),
              _kv('CNIC', w?.cnic ?? 'N/A'),
              _kv('Designation', w?.designation ?? 'N/A'),
              _kv('Requested Unit', app.requestedUnitType ?? 'N/A'),
            ],
          ),
        ),
        const SizedBox(height: 14),
        SectionCard(
          title: 'Required Documents',
          subtitle: '${checks.where((c) => c.approved).length}/${checks.length} approved',
          child: Column(
            children: checks.map((c) {
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.surfaceMuted, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(child: Text(c.label, style: const TextStyle(fontWeight: FontWeight.bold))),
                        StatusPill(c.approved ? 'approved' : (c.docs.isEmpty ? 'missing' : 'pending')),
                      ],
                    ),
                    if (c.docs.isEmpty)
                      const Padding(padding: EdgeInsets.only(top: 6), child: Text('No file uploaded.', style: TextStyle(fontSize: 12, color: AppColors.textLight)))
                    else
                      ...c.docs.map((d) => Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Row(
                              children: [
                                Expanded(child: Text(asStr(d['original_file_name'], 'Document ${asStr(d['id'])}'), style: const TextStyle(fontSize: 12))),
                                TextButton(
                                  onPressed: () => _verifyDoc(asInt(d['id']), true),
                                  child: const Text('Approve', style: TextStyle(color: AppColors.success)),
                                ),
                                TextButton(
                                  onPressed: () => _verifyDoc(asInt(d['id']), false),
                                  child: const Text('Reject', style: TextStyle(color: AppColors.error)),
                                ),
                              ],
                            ),
                          )),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => _failVerification(app),
                child: const Text('Fail Verification'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton(
                onPressed: (!allApproved || moved) ? null : () => _moveToCommittee(app),
                child: Text(moved ? 'Moved' : 'Move to Committee'),
              ),
            ),
          ],
        ),
        if (!allApproved)
          const Padding(
            padding: EdgeInsets.only(top: 8),
            child: Text('Saare required documents approve hone par unlock hoga.', style: TextStyle(fontSize: 12, color: AppColors.textLight)),
          ),
      ],
    );
  }

  Widget _kv(String k, String v) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(width: 120, child: Text(k, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary))),
            Expanded(child: Text(v, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600))),
          ],
        ),
      );

  Future<void> _verifyDoc(int id, bool approve) async {
    try {
      if (approve) {
        await _repo.verifyDocument(id);
      } else {
        await _repo.rejectDocument(id);
      }
      if (!mounted) return;
      showToast(context, approve ? 'Document approved.' : 'Document rejected.', success: approve, error: !approve);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }

  Future<void> _moveToCommittee(Application app) async {
    final rentCtrl = TextEditingController(text: app.recommendedRentAmount > 0 ? app.recommendedRentAmount.round().toString() : '');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Move to Committee'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Worker basic pay ke hisaab se recommended monthly rent enter karein.', style: TextStyle(fontSize: 13)),
            const SizedBox(height: 12),
            TextField(controller: rentCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Recommended Rent', border: OutlineInputBorder(), prefixText: 'Rs. ')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Move')),
        ],
      ),
    );
    if (ok != true) return;
    final rent = num.tryParse(rentCtrl.text.trim()) ?? 0;
    if (rent <= 0) {
      if (mounted) showToast(context, 'Recommended rent required hai.', error: true);
      return;
    }
    try {
      await _repo.verifyApplication(app.id, passed: true, recommendedRent: rent, remarks: 'All required documents approved.');
      if (!mounted) return;
      showToast(context, 'Application committee ko bhej di gayi.', success: true);
      setState(() => _selectedId = null);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }

  Future<void> _failVerification(Application app) async {
    try {
      await _repo.rejectVerification(app.id);
      if (!mounted) return;
      showToast(context, 'Verification failed mark ho gayi.', error: true);
      setState(() => _selectedId = null);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }
}
