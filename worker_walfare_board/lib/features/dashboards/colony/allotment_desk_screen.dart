import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/format.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/models/domain_models.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Allotment Desk — AD (Colonies). After the committee approves an application,
/// AD (Colonies) assigns the flat and attaches the allotment notification here.
class AllotmentDeskScreen extends StatefulWidget {
  const AllotmentDeskScreen({super.key});

  @override
  State<AllotmentDeskScreen> createState() => _AllotmentDeskScreenState();
}

class _AllotmentDeskScreenState extends State<AllotmentDeskScreen> {
  final _repo = ApiRepository.instance;
  bool _loading = true;
  String? _error;

  List<Application> _apps = const [];
  Map<int, Worker> _workers = const {};
  List<Flat> _flats = const [];
  List<Map<String, dynamic>> _colonies = const [];
  List<Map<String, dynamic>> _zones = const [];
  List<Map<String, dynamic>> _users = const [];
  List<Map<String, dynamic>> _assignments = const [];
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
      final r = await Future.wait([
        _repo.applications(),
        _repo.workers(),
        _repo.flats(),
        _repo.colonies(),
        _repo.flatAssignments(),
        _repo.documentTypes(),
        _repo.zones(),
        _repo.users(),
      ]);
      setState(() {
        _apps = r[0].map((e) => Application(e)).toList();
        _workers = {for (final w in r[1].map((e) => Worker(e))) w.id: w};
        _flats = r[2].map((e) => Flat(e)).toList();
        _colonies = r[3];
        _assignments = r[4];
        _docTypes = r[5];
        _zones = r[6];
        _users = r[7];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  int? _notificationDocTypeId() {
    for (final t in _docTypes) {
      final hay = '${asStr(t['name'])} ${asStr(t['code'])}'.toLowerCase();
      if (['allotment notification', 'notification', 'allotment order'].any((term) => hay.contains(term))) {
        return asIntN(t['id']);
      }
    }
    return _docTypes.isNotEmpty ? asIntN(_docTypes.first['id']) : null;
  }

  List<Flat> get _availableFlats {
    final assignedFlatIds = _assignments
        .where((a) => asStr(a['status'], 'active') == 'active')
        .map((a) => asIntN(a['flat_id']))
        .toSet();
    return _flats.where((f) => ['empty', 'reserved'].contains(f.status) && !assignedFlatIds.contains(f.id)).toList();
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

    final approvedApps = _apps.where((a) => a.status == 'approved').toList();
    final selected = _selectedId == null ? null : approvedApps.cast<Application?>().firstWhere((a) => a?.id == _selectedId, orElse: () => null);

    if (selected != null) {
      return _AssignFlatForm(
        app: selected,
        worker: _workers[selected.workerId],
        colonies: _colonies,
        zones: _zones,
        users: _users,
        availableFlats: _availableFlats,
        notificationDocTypeId: _notificationDocTypeId(),
        onBack: () => setState(() => _selectedId = null),
        onDone: () {
          setState(() => _selectedId = null);
          _load();
        },
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: 'Allotment Desk',
            subtitle: 'Committee-approved applications — flat assign + notification.',
            child: approvedApps.isEmpty
                ? const EmptyHint('No approved applications waiting for allotment.')
                : Column(
                    children: approvedApps.map((a) {
                      final w = _workers[a.workerId];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(color: AppColors.surfaceMuted, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                        child: ListTile(
                          title: Text(w?.name ?? 'Worker #${a.workerId}', style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text('#${a.applicationNo} · ${w?.cnic ?? 'CNIC N/A'}', style: const TextStyle(fontSize: 12)),
                          trailing: const Icon(Icons.assignment_turned_in_outlined),
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
}

class _AssignFlatForm extends StatefulWidget {
  const _AssignFlatForm({
    required this.app,
    required this.worker,
    required this.colonies,
    required this.zones,
    required this.users,
    required this.availableFlats,
    required this.notificationDocTypeId,
    required this.onBack,
    required this.onDone,
  });

  final Application app;
  final Worker? worker;
  final List<Map<String, dynamic>> colonies;
  final List<Map<String, dynamic>> zones;
  final List<Map<String, dynamic>> users;
  final List<Flat> availableFlats;
  final int? notificationDocTypeId;
  final VoidCallback onBack;
  final VoidCallback onDone;

  @override
  State<_AssignFlatForm> createState() => _AssignFlatFormState();
}

class _AssignFlatFormState extends State<_AssignFlatForm> {
  final _repo = ApiRepository.instance;
  int? _colonyId;
  int? _flatId;
  File? _notification;
  late final TextEditingController _rent = TextEditingController(
    text: widget.app.recommendedRentAmount > 0 ? widget.app.recommendedRentAmount.round().toString() : '',
  );
  final _remarks = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _rent.dispose();
    _remarks.dispose();
    super.dispose();
  }

  List<Flat> get _flatsForColony => _colonyId == null ? widget.availableFlats : widget.availableFlats.where((f) => f.colonyId == _colonyId).toList();

  Future<void> _pickNotification() async {
    final res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png']);
    final path = res?.files.single.path;
    if (path != null) setState(() => _notification = File(path));
  }

  Future<void> _assign() async {
    final rent = num.tryParse(_rent.text.trim()) ?? 0;
    if (_flatId == null) {
      showToast(context, 'Flat select karein.', error: true);
      return;
    }
    if (rent <= 0) {
      showToast(context, 'Monthly rent set karein.', error: true);
      return;
    }
    if (_notification == null) {
      showToast(context, 'Notification PDF/image zaroori hai.', error: true);
      return;
    }
    if (widget.notificationDocTypeId == null) {
      showToast(context, 'Allotment notification document type pehle banayein.', error: true);
      return;
    }
    setState(() => _saving = true);
    try {
      // 1) Mandatory notification document (must exist before flat assignment).
      await _repo.uploadDocument(
        file: _notification!,
        documentTypeId: widget.notificationDocTypeId!,
        ownerType: 'allotment',
        ownerId: widget.app.workerId,
        applicationId: widget.app.id,
        visibility: 'worker',
        remarks: 'Allotment notification attached by AD (Colonies)',
      );
      // 2) Flat assignment (backend also notifies the colony caretaker + industry).
      await _repo.assignFlat(
        workerId: widget.app.workerId,
        flatId: _flatId!,
        applicationId: widget.app.id,
        rentAmount: rent.round().toString(),
        remarks: _remarks.text.trim().isEmpty ? null : _remarks.text.trim(),
      );
      // 3) Notify the worker / allottee.
      await _repo.createNotification({
        'recipient_type': 'worker',
        'recipient_id': widget.app.workerId,
        'application_id': widget.app.id,
        'title': 'Flat Assigned',
        'message': 'Your flat has been assigned. Please see the attached notification document.',
        'notification_type': 'flat_assignment',
        'status': 'sent',
        'sent_at': DateTime.now().toIso8601String(),
      });
      if (!mounted) return;
      showToast(context, 'Flat assign ho gaya aur notification attach ho gayi.', success: true);
      widget.onDone();
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      showToast(context, e.toString(), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(children: [
          IconButton(onPressed: widget.onBack, icon: const Icon(Icons.arrow_back)),
          const Text('Back to list', style: TextStyle(color: AppColors.textSecondary)),
        ]),
        SectionCard(
          title: 'Assign Flat',
          subtitle: '#${widget.app.applicationNo} · ${widget.worker?.name ?? 'Worker #${widget.app.workerId}'}',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.surfaceMuted, borderRadius: BorderRadius.circular(10)),
                child: Row(children: [
                  const Text('Basic Pay', style: TextStyle(color: AppColors.textSecondary)),
                  const Spacer(),
                  Text(money(widget.worker?.salaryPerMonth), style: const TextStyle(fontWeight: FontWeight.bold)),
                ]),
              ),
              const SizedBox(height: 12),
              TextField(controller: _rent, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Monthly Rent', border: OutlineInputBorder(), prefixText: 'Rs. ')),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                initialValue: _colonyId,
                isExpanded: true,
                decoration: const InputDecoration(labelText: 'Colony', border: OutlineInputBorder()),
                items: widget.colonies.map((c) => DropdownMenuItem(value: asInt(c['id']), child: Text(asStr(c['name'], 'Colony #${asStr(c['id'])}')))).toList(),
                onChanged: (v) => setState(() {
                  _colonyId = v;
                  _flatId = null;
                }),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                initialValue: _flatId,
                isExpanded: true,
                decoration: InputDecoration(labelText: _colonyId == null ? 'Select colony first' : 'Flat', border: const OutlineInputBorder()),
                items: _flatsForColony.map((f) => DropdownMenuItem(value: f.id, child: Text('${f.flatNo} - ${f.flatAddress}', overflow: TextOverflow.ellipsis))).toList(),
                onChanged: _colonyId == null ? null : (v) => setState(() => _flatId = v),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _pickNotification,
                icon: const Icon(Icons.attach_file),
                label: Text(_notification == null ? 'Notification PDF / Image *' : 'Notification selected ✓'),
              ),
              const SizedBox(height: 12),
              TextField(controller: _remarks, maxLines: 2, decoration: const InputDecoration(labelText: 'Allotment Remarks', border: OutlineInputBorder())),
              const SizedBox(height: 16),
              FilledButton(onPressed: _saving ? null : _assign, child: Text(_saving ? 'Assigning...' : 'Assign Flat')),
            ],
          ),
        ),
      ],
    );
  }
}
