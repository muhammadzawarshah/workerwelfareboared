import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../../core/auth/auth_store.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_roles.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/models/domain_models.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Applications list joined with worker info. Shared by industry_admin, AD
/// (Colonies), colony section, committee and director. Caretaker forwards
/// submitted applications to AD (Colonies); AD (Colonies) sends them on to the
/// committee with a recommended rent.
class ApplicationsScreen extends StatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  State<ApplicationsScreen> createState() => _ApplicationsScreenState();
}

class _ApplicationsScreenState extends State<ApplicationsScreen> {
  final _repo = ApiRepository.instance;
  final _role = AuthStore.instance.user!.role;
  bool _loading = true;
  String? _error;
  List<Application> _apps = const [];
  Map<int, Worker> _workers = const {};
  List<Map<String, dynamic>> _documents = const [];
  Map<int, String> _docTypeNames = const {};
  String _query = '';

  bool get _isCaretaker => _role == AppRoles.careTakerLabourColony;
  bool get _isAdColony => [AppRoles.adColoniesZone1, AppRoles.adColoniesZone2, AppRoles.colonySection, AppRoles.directorAdmin, AppRoles.admin, AppRoles.superAdmin].contains(_role);

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
      final results = await Future.wait([_repo.applications(), _repo.workers(), _repo.documents(), _repo.documentTypes()]);
      final apps = results[0].map((e) => Application(e)).toList();
      final workers = {for (final w in results[1].map((e) => Worker(e))) w.id: w};
      setState(() {
        _apps = apps;
        _workers = workers;
        _documents = results[2];
        _docTypeNames = {for (final t in results[3]) asInt(t['id']): asStr(t['name'], asStr(t['code']))};
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  // Caretaker first reviews the worker details + uploaded files, then forwards.
  Future<void> _reviewAndForward(Application app) async {
    final docs = _documents.where((d) => asIntN(d['application_id']) == app.id).toList();
    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _ReviewForwardSheet(
        app: app,
        worker: _workers[app.workerId],
        documents: docs,
        docTypeName: (id) => _docTypeNames[id] ?? 'Document',
      ),
    );
    if (confirmed != true) return;
    try {
      await _repo.forwardApplicationToAdColony(app.id);
      if (!mounted) return;
      showToast(context, 'Review ke baad AD (Colonies) ko forward ho gayi.', success: true);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }

  // AD (Colonies) sets the recommended rent and sends it to the committee.
  Future<void> _sendToCommittee(Application app) async {
    final rentCtrl = TextEditingController(text: app.recommendedRentAmount > 0 ? app.recommendedRentAmount.round().toString() : '');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Send to Committee'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('#${app.applicationNo} — recommended rent set karein.', style: const TextStyle(fontSize: 13)),
            const SizedBox(height: 12),
            TextField(controller: rentCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Recommended Rent', border: OutlineInputBorder(), prefixText: 'Rs. ')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Send')),
        ],
      ),
    );
    if (ok != true) return;
    final rent = num.tryParse(rentCtrl.text.trim()) ?? 0;
    if (rent <= 0) {
      if (mounted) showToast(context, 'Recommended rent zaroori hai.', error: true);
      return;
    }
    try {
      await _repo.forwardApplicationToCommittee(app.id, recommendedRent: rent);
      if (!mounted) return;
      showToast(context, 'Committee ko bhej diya.', success: true);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }

  Widget? _actionFor(Application app) {
    if (_isCaretaker && ['submitted', 'under_verification'].contains(app.status)) {
      return OutlinedButton(
        onPressed: () => _reviewAndForward(app),
        style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), minimumSize: Size.zero),
        child: const Text('Review & Forward', style: TextStyle(fontSize: 12)),
      );
    }
    if (_isAdColony && ['under_verification', 'verified', 'committee_pending'].contains(app.status)) {
      return FilledButton(
        onPressed: () => _sendToCommittee(app),
        style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), minimumSize: Size.zero),
        child: const Text('Send to Committee', style: TextStyle(fontSize: 12)),
      );
    }
    return null;
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

    final filtered = _apps.where((a) {
      if (_query.isEmpty) return true;
      final w = _workers[a.workerId];
      final hay = '${a.applicationNo} ${a.status} ${w?.name ?? ''} ${w?.cnic ?? ''}'.toLowerCase();
      return hay.contains(_query.toLowerCase());
    }).toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: 'Applications',
            subtitle: '${_apps.length} total applications',
            child: Column(
              children: [
                TextField(
                  onChanged: (v) => setState(() => _query = v),
                  decoration: const InputDecoration(
                    hintText: 'Search name / CNIC / status...',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                    isDense: true,
                  ),
                ),
                const SizedBox(height: 12),
                if (filtered.isEmpty)
                  const EmptyHint('No applications found.')
                else
                  ...filtered.map((a) {
                    final w = _workers[a.workerId];
                    final action = _actionFor(a);
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
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(w?.name ?? 'Worker #${a.workerId}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 2),
                                    Text('#${a.applicationNo} · ${w?.cnic ?? 'CNIC N/A'}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                    if (a.requestedUnitType != null)
                                      Text('Unit: ${a.requestedUnitType}', style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
                                  ],
                                ),
                              ),
                              StatusPill(a.status),
                            ],
                          ),
                          if (action != null) ...[
                            const SizedBox(height: 8),
                            Align(alignment: Alignment.centerRight, child: action),
                          ],
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Review & forward sheet (caretaker) ─────────────────────────────────────────

class _ReviewForwardSheet extends StatelessWidget {
  const _ReviewForwardSheet({required this.app, required this.worker, required this.documents, required this.docTypeName});

  final Application app;
  final Worker? worker;
  final List<Map<String, dynamic>> documents;
  final String Function(int) docTypeName;

  Future<void> _preview(BuildContext context, Map<String, dynamic> doc) async {
    final id = asIntN(doc['id']);
    final mime = asStr(doc['mime_type']);
    final name = asStr(doc['original_file_name'], 'Document');
    if (id == null) return;
    if (!mime.startsWith('image/')) {
      showToast(context, '$name preview nahi ho sakta — sirf images preview hoti hain.');
      return;
    }
    try {
      final bytes = await ApiRepository.instance.downloadDocument(id);
      if (!context.mounted) return;
      showDialog(
        context: context,
        builder: (_) => Dialog(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Padding(padding: const EdgeInsets.all(12), child: Text(name, style: const TextStyle(fontWeight: FontWeight.w600))),
            Flexible(child: InteractiveViewer(child: Image.memory(Uint8List.fromList(bytes)))),
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
          ]),
        ),
      );
    } catch (e) {
      if (context.mounted) showToast(context, e.toString(), error: true);
    }
  }

  Widget _row(String k, String? v) {
    if (v == null || v.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(width: 120, child: Text(k, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12))),
        Expanded(child: Text(v, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500))),
      ]),
    );
  }

  @override
  Widget build(BuildContext context) {
    final w = worker;
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.85,
        maxChildSize: 0.95,
        builder: (_, scrollController) => Container(
          padding: const EdgeInsets.all(20),
          child: ListView(
            controller: scrollController,
            children: [
              Text('Review Application', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              Text('#${app.applicationNo} · ${app.applicationType.replaceAll('_', ' ')}', style: const TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 16),
              const Text('Worker Details', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              _row('Name', w?.name),
              _row('Father Name', w?.fatherName),
              _row('CNIC', w?.cnic),
              _row('DOB', asStrN(w?.raw['dob'])?.toString().split('T').first),
              _row('Designation', w?.designation),
              _row('Salary', w?.salaryPerMonth != null && w!.salaryPerMonth > 0 ? 'Rs. ${w.salaryPerMonth.round()}' : null),
              _row('Mobile', asStrN(w?.raw['mobile_no_1'])),
              _row('Dependents', asStrN(w?.raw['total_number_dependents'])?.toString()),
              _row('Requested Unit', app.requestedUnitType),
              const Divider(height: 28),
              Text('Uploaded Documents (${documents.length})', style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              if (documents.isEmpty)
                const EmptyHint('Is application ke koi documents nahi.')
              else
                ...documents.map((d) {
                  final status = asStr(d['status'], 'pending');
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(color: AppColors.surfaceMuted, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
                    child: ListTile(
                      leading: Icon(asStr(d['mime_type']).startsWith('image/') ? Icons.image_outlined : Icons.description_outlined, color: AppColors.primary),
                      title: Text(docTypeName(asInt(d['document_type_id'])), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      subtitle: Text(asStr(d['original_file_name'], 'File'), style: const TextStyle(fontSize: 11), overflow: TextOverflow.ellipsis),
                      trailing: StatusPill(status),
                      onTap: () => _preview(context, d),
                    ),
                  );
                }),
              const SizedBox(height: 20),
              Row(children: [
                Expanded(child: OutlinedButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel'))),
                const SizedBox(width: 12),
                Expanded(child: FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Forward to AD Colony'))),
              ]),
            ],
          ),
        ),
      ),
    );
  }
}
