import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../../../core/auth/auth_store.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/json_parse.dart';
import '../../../core/utils/location_helper.dart';
import '../../../data/models/domain_models.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Complaint register. Mirrors the website's ComplaintDashboard: list with
/// metrics, file a new complaint, forward (assign) to a caretaker, and resolve.
/// Shared by colony_admin and director.
class ComplaintsScreen extends StatefulWidget {
  const ComplaintsScreen({super.key});

  @override
  State<ComplaintsScreen> createState() => _ComplaintsScreenState();
}

class _ComplaintsScreenState extends State<ComplaintsScreen> {
  final _repo = ApiRepository.instance;
  final _role = AuthStore.instance.user?.role ?? '';

  // Only the caretaker verifies "done"; only management / colony section dispatch
  // (forward). Works wing is view-only here.
  bool get _isCaretaker => _role == 'care_taker_labour_colony';
  bool get _canDispatch => ['super_admin', 'admin', 'director_admin', 'colony_section'].contains(_role);

  bool _loading = true;
  String? _error;
  List<Complaint> _complaints = const [];
  List<Map<String, dynamic>> _colonies = const [];
  List<Map<String, dynamic>> _users = const [];
  List<Map<String, dynamic>> _docTypes = const [];
  String _query = '';

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
      final r = await Future.wait([_repo.complaints(), _repo.colonies(), _repo.users(), _repo.documentTypes()]);
      setState(() {
        _complaints = r[0].map((e) => Complaint(e)).toList();
        _colonies = r[1];
        _users = r[2];
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

  String _colonyName(int? id) {
    final c = _colonies.cast<Map<String, dynamic>?>().firstWhere((x) => asIntN(x?['id']) == id, orElse: () => null);
    return c == null ? '—' : asStr(c['name'], 'Colony #$id');
  }

  Future<void> _forward(Complaint c) async {
    final caretakers = _users.where((u) => asStr(u['role']) == 'care_taker_labour_colony').toList();
    if (caretakers.isEmpty) {
      showToast(context, 'Koi caretaker available nahi.', error: true);
      return;
    }
    int? selected;
    final titleCtrl = TextEditingController(text: 'Complaint #${c.id}');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: Text('Forward Complaint #${c.id}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<int>(
                initialValue: selected,
                isExpanded: true,
                decoration: const InputDecoration(labelText: 'Forward to caretaker', border: OutlineInputBorder()),
                items: caretakers.map((u) => DropdownMenuItem(value: asInt(u['id']), child: Text(asStr(u['name'])))).toList(),
                onChanged: (v) => setLocal(() => selected = v),
              ),
              const SizedBox(height: 12),
              TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Task Title', border: OutlineInputBorder())),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Forward')),
          ],
        ),
      ),
    );
    if (ok != true || selected == null) return;
    try {
      await _repo.assignComplaint(c.id, {
        'assigned_caretaker_id': selected,
        'task_title': titleCtrl.text.trim(),
      });
      if (!mounted) return;
      showToast(context, 'Complaint forward ho gayi.', success: true);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }

  int? _proofDocTypeId() {
    for (final t in _docTypes) {
      final hay = '${asStr(t['name'])} ${asStr(t['code'])}'.toLowerCase();
      if (['complaint proof', 'task proof', 'maintenance proof', 'repair proof', 'proof'].any(hay.contains)) {
        return asIntN(t['id']);
      }
    }
    return _docTypes.isNotEmpty ? asIntN(_docTypes.first['id']) : null;
  }

  // Caretaker verifies the work is done: pick an image/video, capture current
  // GPS, upload it, then resolve. Backend checks the GPS is within the
  // complaint's radius when the complaint has a pinned location.
  Future<void> _verifyDone(Complaint c) async {
    final picked = await FilePicker.platform.pickFiles(type: FileType.media);
    final path = picked?.files.single.path;
    if (path == null) return;
    final docTypeId = _proofDocTypeId();
    if (!mounted) return;
    if (docTypeId == null) {
      showToast(context, 'Proof document type missing — pehle banayein.', error: true);
      return;
    }
    showToast(context, 'Location li ja rahi hai...');
    try {
      double? lat, lng;
      if (c.latitude != null && c.longitude != null) {
        final pos = await LocationHelper.current();
        lat = pos.latitude;
        lng = pos.longitude;
      }
      final doc = await _repo.uploadDocument(
        file: File(path),
        documentTypeId: docTypeId,
        ownerType: 'complaint',
        ownerId: c.id,
        visibility: 'caretaker',
        remarks: 'Complaint resolution proof',
      );
      final docId = asIntN(doc['id']);
      if (docId == null) throw Exception('Upload failed');
      await _repo.resolveComplaintWithProof(c.id, imageDocumentId: docId, latitude: lat, longitude: lng);
      if (!mounted) return;
      showToast(context, 'Complaint verify ho gayi — kaam done mark ho gaya.', success: true);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }

  Future<void> _newComplaint() async {
    final data = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _NewComplaintSheet(colonies: _colonies),
    );
    if (data == null) return;
    try {
      await _repo.createComplaint(data);
      if (!mounted) return;
      showToast(context, 'Complaint darj ho gayi.', success: true);
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

    final pending = _complaints.where((c) => ['pending', 'open'].contains(c.status)).length;
    final inProgress = _complaints.where((c) => c.status == 'in_progress').length;
    final resolved = _complaints.where((c) => ['resolved', 'closed'].contains(c.status)).length;
    final filtered = _complaints.where((c) {
      if (_query.isEmpty) return true;
      return '${c.complaintDesc} ${c.status} ${c.complaintType ?? ''}'.toLowerCase().contains(_query.toLowerCase());
    }).toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          MetricGrid(children: [
            MetricCard(title: 'Total', value: '${_complaints.length}', icon: Icons.support_agent_outlined),
            MetricCard(title: 'Pending', value: '$pending', tone: MetricTone.amber, icon: Icons.hourglass_bottom_outlined),
            MetricCard(title: 'In Progress', value: '$inProgress', tone: MetricTone.blue, icon: Icons.sync_outlined),
            MetricCard(title: 'Resolved', value: '$resolved', tone: MetricTone.green, icon: Icons.verified_outlined),
          ]),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Complaint Register',
            subtitle: '${filtered.length} records',
            trailing: FilledButton(
              onPressed: _newComplaint,
              style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), minimumSize: Size.zero),
              child: const Text('New'),
            ),
            child: Column(
              children: [
                TextField(
                  onChanged: (v) => setState(() => _query = v),
                  decoration: const InputDecoration(hintText: 'Search complaints...', prefixIcon: Icon(Icons.search), border: OutlineInputBorder(), isDense: true),
                ),
                const SizedBox(height: 12),
                if (filtered.isEmpty)
                  const EmptyHint('No complaints found.')
                else
                  ...filtered.map(_complaintTile),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _complaintTile(Complaint c) {
    final isAsset = c.complaintType == 'asset' || c.complaintDesc.startsWith('[Asset:');
    final desc = c.complaintDesc.replaceFirst(RegExp(r'^\[Asset:[^\]]+\]\s*'), '');
    final done = ['resolved', 'closed'].contains(c.status);
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: (isAsset ? AppColors.warning : AppColors.secondary).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                child: Text(isAsset ? 'Asset' : 'General', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: isAsset ? AppColors.warning : AppColors.secondary)),
              ),
              const SizedBox(width: 8),
              Text('#CMP-${1040 + c.id}', style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
              const Spacer(),
              StatusPill(c.status),
            ],
          ),
          const SizedBox(height: 6),
          Text(desc, style: const TextStyle(fontSize: 13)),
          const SizedBox(height: 4),
          Text('Colony: ${_colonyName(c.colonyId)}', style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (!done) ...[
                if (_canDispatch) ...[
                  OutlinedButton(
                    onPressed: () => _forward(c),
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), minimumSize: Size.zero),
                    child: const Text('Forward'),
                  ),
                  const SizedBox(width: 8),
                ],
                if (_isCaretaker)
                  FilledButton(
                    onPressed: () => _verifyDone(c),
                    style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), minimumSize: Size.zero, backgroundColor: AppColors.success),
                    child: const Text('Verify Done'),
                  ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

// ── New complaint sheet ────────────────────────────────────────────────────────

class _NewComplaintSheet extends StatefulWidget {
  const _NewComplaintSheet({required this.colonies});
  final List<Map<String, dynamic>> colonies;

  @override
  State<_NewComplaintSheet> createState() => _NewComplaintSheetState();
}

class _NewComplaintSheetState extends State<_NewComplaintSheet> {
  static const _assetCats = [
    ['street_light', 'Street Light'],
    ['transformer', 'Transformer'],
    ['tube_well', 'Tube Well'],
    ['generator', 'Generator'],
    ['water_tank', 'Water Tank'],
    ['road', 'Road / Pathway'],
    ['other', 'Other'],
  ];

  String _type = 'asset';
  String _assetType = 'street_light';
  int? _colonyId;
  double? _lat;
  double? _lng;
  bool _locating = false;
  final _desc = TextEditingController();

  @override
  void dispose() {
    _desc.dispose();
    super.dispose();
  }

  Future<void> _captureLocation() async {
    setState(() => _locating = true);
    try {
      final pos = await LocationHelper.current();
      setState(() {
        _lat = pos.latitude;
        _lng = pos.longitude;
        _locating = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _locating = false);
      showToast(context, e.toString(), error: true);
    }
  }

  void _submit() {
    if (_desc.text.trim().isEmpty) {
      showToast(context, 'Description required.', error: true);
      return;
    }
    final label = _assetCats.firstWhere((c) => c[0] == _assetType)[1];
    final descText = _type == 'asset' ? '[Asset: $label] ${_desc.text.trim()}' : _desc.text.trim();
    Navigator.pop(context, {
      'complaint_desc': descText,
      'complaint_type': _type,
      if (_colonyId != null) 'colony_id': _colonyId,
      if (_lat != null) 'latitude': _lat,
      if (_lng != null) 'longitude': _lng,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('New Complaint', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _type,
              decoration: const InputDecoration(labelText: 'Complaint Type', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'asset', child: Text('Asset Problem')),
                DropdownMenuItem(value: 'general', child: Text('General Complaint')),
              ],
              onChanged: (v) => setState(() => _type = v ?? 'asset'),
            ),
            if (_type == 'asset') ...[
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _assetType,
                decoration: const InputDecoration(labelText: 'Asset Type', border: OutlineInputBorder()),
                items: _assetCats.map((c) => DropdownMenuItem(value: c[0], child: Text(c[1]))).toList(),
                onChanged: (v) => setState(() => _assetType = v ?? 'street_light'),
              ),
            ],
            const SizedBox(height: 12),
            DropdownButtonFormField<int>(
              initialValue: _colonyId,
              isExpanded: true,
              decoration: const InputDecoration(labelText: 'Colony (optional)', border: OutlineInputBorder()),
              items: widget.colonies.map((c) => DropdownMenuItem(value: asInt(c['id']), child: Text(asStr(c['name'], 'Colony #${asStr(c['id'])}')))).toList(),
              onChanged: (v) => setState(() => _colonyId = v),
            ),
            const SizedBox(height: 12),
            TextField(controller: _desc, maxLines: 3, decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _locating ? null : _captureLocation,
              icon: const Icon(Icons.my_location),
              label: Text(_locating
                  ? 'Location li ja rahi hai...'
                  : _lat != null
                      ? 'Location set ✓ (${_lat!.toStringAsFixed(5)}, ${_lng!.toStringAsFixed(5)})'
                      : 'Capture location (masla yahan hai)'),
            ),
            const SizedBox(height: 16),
            FilledButton(onPressed: _submit, child: const Text('Submit Complaint')),
          ],
        ),
      ),
    );
  }
}
