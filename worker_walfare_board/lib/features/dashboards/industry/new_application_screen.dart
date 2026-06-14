import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Industry portal "Apply / Allotment" form. Mirrors the website's
/// NewApplicationForm: creates the worker + application atomically via
/// `/worker-applications/intake`, then uploads the required documents.
class NewApplicationScreen extends StatefulWidget {
  const NewApplicationScreen({super.key, this.onSubmitted});
  final VoidCallback? onSubmitted;

  @override
  State<NewApplicationScreen> createState() => _NewApplicationScreenState();
}

class _NewApplicationScreenState extends State<NewApplicationScreen> {
  static const _requiredDocs = ['CNIC', 'Domicile', 'ESSI Verification', 'EOBI Verification', 'Appointment Letter', 'Salary Proof'];

  final _form = GlobalKey<FormState>();
  final _ctrl = <String, TextEditingController>{
    for (final k in ['name', 'father', 'cnic', 'dob', 'essi', 'eobi', 'designation', 'salary', 'mobile', 'dependents', 'unit', 'address'])
      k: TextEditingController(),
  };
  final _docs = <String, File>{};
  List<Map<String, dynamic>> _docTypes = const [];
  bool _submitting = false;
  // New allotment vs reassignment (a previously cancelled/vacated flat to a new worker).
  String _allotmentType = 'new_allotment';
  final _reassignNote = TextEditingController();

  @override
  void initState() {
    super.initState();
    ApiRepository.instance.documentTypes().then((d) {
      if (mounted) setState(() => _docTypes = d);
    }).catchError((_) => null);
  }

  @override
  void dispose() {
    for (final c in _ctrl.values) {
      c.dispose();
    }
    _reassignNote.dispose();
    super.dispose();
  }

  int? _docTypeIdFor(String label) {
    final norm = label.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
    for (final t in _docTypes) {
      final name = asStr(t['name']).toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
      final code = asStr(t['code']).toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
      if (name == norm || code == norm || name.contains(norm) || code.contains(norm)) return asIntN(t['id']);
    }
    return null;
  }

  Future<void> _pickDoc(String label) async {
    final res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png']);
    final path = res?.files.single.path;
    if (path != null) setState(() => _docs[label] = File(path));
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      final res = await ApiRepository.instance.intake(
        worker: {
          'name': _ctrl['name']!.text.trim(),
          'father_name': _ctrl['father']!.text.trim(),
          'cnic': _ctrl['cnic']!.text.trim(),
          'dob': _ctrl['dob']!.text.trim(),
          if (_ctrl['address']!.text.trim().isNotEmpty) 'address': _ctrl['address']!.text.trim(),
          if (_ctrl['essi']!.text.trim().isNotEmpty) 'essi_no': _ctrl['essi']!.text.trim(),
          if (_ctrl['eobi']!.text.trim().isNotEmpty) 'eobi_no': _ctrl['eobi']!.text.trim(),
          if (_ctrl['designation']!.text.trim().isNotEmpty) 'designation': _ctrl['designation']!.text.trim(),
          if (_ctrl['salary']!.text.trim().isNotEmpty) 'salary_per_month': int.tryParse(_ctrl['salary']!.text.trim()),
          if (_ctrl['mobile']!.text.trim().isNotEmpty) 'mobile_no_1': _ctrl['mobile']!.text.trim(),
          if (_ctrl['dependents']!.text.trim().isNotEmpty) 'total_number_dependents': int.tryParse(_ctrl['dependents']!.text.trim()),
          'worker_type': 'industry',
          'status': 'pending',
        },
        application: {
          'application_no': 'APP-${DateTime.now().millisecondsSinceEpoch}',
          'application_type': _allotmentType,
          'status': 'submitted',
          'requested_unit_type': _ctrl['unit']!.text.trim().isEmpty ? 'Type-A' : _ctrl['unit']!.text.trim(),
          'remarks': _allotmentType == 'reallotment'
              ? 'Reassignment (previous allotment cancelled/vacated).${_reassignNote.text.trim().isEmpty ? '' : ' ${_reassignNote.text.trim()}'}'
              : 'New flat assignment.',
        },
      );

      final worker = res['worker'] as Map<String, dynamic>?;
      final application = res['application'] as Map<String, dynamic>?;
      final workerId = asIntN(worker?['id']);
      final applicationId = asIntN(application?['id']);

      for (final docName in _requiredDocs) {
        final file = _docs[docName];
        if (file == null) continue;
        final typeId = _docTypeIdFor(docName);
        if (typeId == null) continue;
        await ApiRepository.instance.uploadDocument(
          file: file,
          documentTypeId: typeId,
          ownerType: 'worker',
          ownerId: workerId,
          applicationId: applicationId,
          visibility: docName == 'Salary Proof' ? 'finance' : 'director',
          remarks: '$docName uploaded from mobile allotment form',
        );
      }

      if (!mounted) return;
      showToast(context, 'Application & documents submit ho gaye.', success: true);
      _form.currentState!.reset();
      for (final c in _ctrl.values) {
        c.clear();
      }
      setState(() {
        _docs.clear();
        _submitting = false;
      });
      widget.onSubmitted?.call();
    } catch (e) {
      if (!mounted) return;
      setState(() => _submitting = false);
      showToast(context, e.toString(), error: true);
    }
  }

  String? _req(String? v) => (v == null || v.trim().isEmpty) ? 'Required' : null;

  String? _cnicValidator(String? v) {
    if (v == null || v.trim().isEmpty) return 'Required';
    final digits = v.replaceAll(RegExp(r'\D'), '');
    if (digits.length != 13) return 'CNIC must be 13 digits';
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SectionCard(
          title: 'New Allotment Application',
          subtitle: 'Worker profile, eligibility, aur required documents.',
          child: Form(
            key: _form,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Padding(
                  padding: EdgeInsets.only(bottom: 8),
                  child: Text('Allotment Type *', style: TextStyle(fontWeight: FontWeight.w600)),
                ),
                Wrap(
                  spacing: 8,
                  children: [
                    ChoiceChip(
                      label: const Text('New Flat Assignment'),
                      selected: _allotmentType == 'new_allotment',
                      onSelected: (_) => setState(() => _allotmentType = 'new_allotment'),
                    ),
                    ChoiceChip(
                      label: const Text('Reassignment'),
                      selected: _allotmentType == 'reallotment',
                      onSelected: (_) => setState(() => _allotmentType = 'reallotment'),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 4, bottom: 4),
                  child: Text(
                    _allotmentType == 'reallotment'
                        ? 'Kisi aur ka allotment cancel/vacate hua, naya worker enter ho raha hai.'
                        : 'Naya allotment — pehli dafa flat chahiye.',
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                ),
                if (_allotmentType == 'reallotment')
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: TextField(
                      controller: _reassignNote,
                      decoration: const InputDecoration(labelText: 'Reassignment detail (optional) — flat no / kis ka cancel hua', border: OutlineInputBorder()),
                    ),
                  ),
                const Divider(height: 24),
                _field('name', 'Worker Name *', validator: _req),
                _field('father', 'Father Name *', validator: _req),
                _field('cnic', 'CNIC *', keyboard: TextInputType.number, validator: _cnicValidator),
                _field('dob', 'Date of Birth * (YYYY-MM-DD)', validator: _req, onTapDate: true),
                _field('designation', 'Designation'),
                _field('salary', 'Salary (per month)', keyboard: TextInputType.number),
                _field('mobile', 'Mobile No', keyboard: TextInputType.phone),
                _field('essi', 'ESSI No'),
                _field('eobi', 'EOBI No'),
                _field('dependents', 'Dependents', keyboard: TextInputType.number),
                _field('unit', 'Requested Unit Type'),
                _field('address', 'Address', maxLines: 2),
                const SizedBox(height: 16),
                const Text('Required Documents', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ..._requiredDocs.map(_docTile),
                const SizedBox(height: 18),
                FilledButton(
                  onPressed: _submitting ? null : _submit,
                  child: Text(_submitting ? 'Submitting...' : 'Submit Application'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _field(String key, String label, {TextInputType? keyboard, String? Function(String?)? validator, int maxLines = 1, bool onTapDate = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: _ctrl[key],
        keyboardType: keyboard,
        maxLines: maxLines,
        readOnly: onTapDate,
        onTap: onTapDate
            ? () async {
                final now = DateTime.now();
                final picked = await showDatePicker(
                  context: context,
                  initialDate: DateTime(now.year - 25),
                  firstDate: DateTime(1940),
                  lastDate: now,
                );
                if (picked != null) {
                  _ctrl[key]!.text = picked.toIso8601String().substring(0, 10);
                }
              }
            : null,
        validator: validator,
        decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
      ),
    );
  }

  Widget _docTile(String doc) {
    final picked = _docs[doc] != null;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: picked ? AppColors.success.withValues(alpha: 0.07) : AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: picked ? AppColors.success : AppColors.border),
      ),
      child: ListTile(
        dense: true,
        leading: Icon(picked ? Icons.check_circle : Icons.upload_file_outlined, color: picked ? AppColors.success : AppColors.textSecondary),
        title: Text(doc, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        subtitle: Text(picked ? _docs[doc]!.path.split(RegExp(r'[\\/]')).last : 'PDF, JPG or PNG', style: const TextStyle(fontSize: 11)),
        trailing: TextButton(onPressed: () => _pickDoc(doc), child: Text(picked ? 'Change' : 'Pick')),
      ),
    );
  }
}
