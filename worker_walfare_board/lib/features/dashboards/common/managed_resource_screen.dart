import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Type of input rendered for a [ManagedField].
enum ManagedFieldType { text, number, multiline, select, stringSelect }

/// A selectable option for an int `select` field (FK id sent to the backend).
class SelectOption {
  const SelectOption(this.value, this.label);
  final int value;
  final String label;
}

/// A selectable option for a `stringSelect` field (e.g. a role enum value).
class StringOption {
  const StringOption(this.value, this.label);
  final String value;
  final String label;
}

/// Declarative description of one editable field on a managed resource.
class ManagedField {
  const ManagedField(
    this.key,
    this.label, {
    this.type = ManagedFieldType.text,
    this.required = false,
    this.optionsKey,
    this.stringOptions,
    this.createOnly = false,
  });

  final String key;
  final String label;
  final ManagedFieldType type;
  final bool required;

  /// For [ManagedFieldType.select]: key into the related-options map provided by
  /// [ManagedResourceScreen.relatedLoader].
  final String? optionsKey;

  /// For [ManagedFieldType.stringSelect]: the static list of string options.
  final List<StringOption>? stringOptions;

  /// When true, the field is only shown when creating (e.g. a password) — hidden
  /// while editing an existing record.
  final bool createOnly;
}

/// Generic create / read / update / delete list screen over a backend resource.
///
/// Mirrors the website's management tables on mobile: lists records, and (when
/// [canManage] is true) lets the user add, edit, and delete via a bottom-sheet
/// form built from [fields]. Dropdown (`select`) options are loaded once via
/// [relatedLoader] and keyed by [ManagedField.optionsKey].
class ManagedResourceScreen extends StatefulWidget {
  const ManagedResourceScreen({
    super.key,
    required this.title,
    required this.subtitle,
    required this.path,
    required this.fetch,
    required this.fields,
    required this.titleOf,
    required this.canManage,
    this.subtitleOf,
    this.statusOf,
    this.relatedLoader,
    this.leading = Icons.list_alt_outlined,
    this.idKey = 'id',
  });

  final String title;
  final String subtitle;

  /// REST path for create/update/delete, e.g. `/colonies` or `/zones`.
  final String path;
  final Future<List<Map<String, dynamic>>> Function() fetch;
  final List<ManagedField> fields;
  final String Function(Map<String, dynamic>) titleOf;
  final String Function(Map<String, dynamic>)? subtitleOf;
  final String? Function(Map<String, dynamic>)? statusOf;
  final bool canManage;
  final Future<Map<String, List<SelectOption>>> Function()? relatedLoader;
  final IconData leading;
  final String idKey;

  @override
  State<ManagedResourceScreen> createState() => _ManagedResourceScreenState();
}

class _ManagedResourceScreenState extends State<ManagedResourceScreen> {
  final _repo = ApiRepository.instance;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _rows = const [];
  Map<String, List<SelectOption>> _options = const {};

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
      final results = await Future.wait([
        widget.fetch(),
        if (widget.relatedLoader != null) widget.relatedLoader!(),
      ]);
      setState(() {
        _rows = results[0] as List<Map<String, dynamic>>;
        _options = results.length > 1 ? results[1] as Map<String, List<SelectOption>> : const {};
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _openForm({Map<String, dynamic>? row}) async {
    final body = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _ResourceForm(
        title: row == null ? 'Add ${widget.title}' : 'Edit ${widget.title}',
        fields: widget.fields,
        options: _options,
        initial: row,
      ),
    );
    if (body == null) return;
    try {
      if (row == null) {
        await _repo.createResource(widget.path, body);
      } else {
        await _repo.updateResource(widget.path, asInt(row[widget.idKey]), body);
      }
      if (!mounted) return;
      showToast(context, row == null ? 'Created successfully.' : 'Updated successfully.', success: true);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }

  Future<void> _confirmDelete(Map<String, dynamic> row) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete record?'),
        content: Text('"${widget.titleOf(row)}" delete karein? Yeh action wapas nahi hoga.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await _repo.deleteResource(widget.path, asInt(row[widget.idKey]));
      if (!mounted) return;
      showToast(context, 'Deleted successfully.', success: true);
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
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off_outlined, size: 44, color: AppColors.textLight),
              const SizedBox(height: 12),
              Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 16),
              FilledButton.icon(onPressed: _load, icon: const Icon(Icons.refresh), label: const Text('Retry')),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      floatingActionButton: widget.canManage
          ? FloatingActionButton.extended(
              onPressed: () => _openForm(),
              icon: const Icon(Icons.add),
              label: Text('Add ${widget.title}'),
            )
          : null,
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
          children: [
            SectionCard(
              title: widget.title,
              subtitle: '${widget.subtitle} · ${_rows.length} records',
              child: _rows.isEmpty
                  ? const EmptyHint('No records found.')
                  : Column(
                      children: _rows.map(_buildRow).toList(),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(Map<String, dynamic> row) {
    final status = widget.statusOf?.call(row);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(widget.leading, size: 20, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.titleOf(row), style: const TextStyle(fontWeight: FontWeight.w600)),
                if (widget.subtitleOf != null) ...[
                  const SizedBox(height: 2),
                  Text(widget.subtitleOf!(row), style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                ],
              ],
            ),
          ),
          if (status != null && status.isNotEmpty) StatusPill(status),
          if (widget.canManage) ...[
            IconButton(
              visualDensity: VisualDensity.compact,
              tooltip: 'Edit',
              icon: const Icon(Icons.edit_outlined, size: 20, color: AppColors.secondary),
              onPressed: () => _openForm(row: row),
            ),
            IconButton(
              visualDensity: VisualDensity.compact,
              tooltip: 'Delete',
              icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.error),
              onPressed: () => _confirmDelete(row),
            ),
          ],
        ],
      ),
    );
  }
}

/// Bottom-sheet form that edits/creates one record. Pops with the built request
/// body map on save, or null on cancel.
class _ResourceForm extends StatefulWidget {
  const _ResourceForm({
    required this.title,
    required this.fields,
    required this.options,
    this.initial,
  });

  final String title;
  final List<ManagedField> fields;
  final Map<String, List<SelectOption>> options;
  final Map<String, dynamic>? initial;

  @override
  State<_ResourceForm> createState() => _ResourceFormState();
}

class _ResourceFormState extends State<_ResourceForm> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, TextEditingController> _controllers = {};
  final Map<String, int?> _selectValues = {};
  final Map<String, String?> _stringValues = {};

  bool get _editing => widget.initial != null;

  /// Fields shown right now (create-only fields are hidden while editing).
  List<ManagedField> get _visibleFields =>
      widget.fields.where((f) => !(f.createOnly && _editing)).toList();

  @override
  void initState() {
    super.initState();
    for (final f in _visibleFields) {
      if (f.type == ManagedFieldType.select) {
        _selectValues[f.key] = asIntN(widget.initial?[f.key]);
      } else if (f.type == ManagedFieldType.stringSelect) {
        _stringValues[f.key] = asStrN(widget.initial?[f.key]);
      } else {
        _controllers[f.key] = TextEditingController(text: asStr(widget.initial?[f.key]));
      }
    }
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    final body = <String, dynamic>{};
    for (final f in _visibleFields) {
      if (f.type == ManagedFieldType.select) {
        final v = _selectValues[f.key];
        if (v != null) body[f.key] = v;
      } else if (f.type == ManagedFieldType.stringSelect) {
        final v = _stringValues[f.key];
        if (v != null && v.isNotEmpty) body[f.key] = v;
      } else {
        final text = _controllers[f.key]!.text.trim();
        if (text.isEmpty) continue;
        if (f.type == ManagedFieldType.number) {
          body[f.key] = num.tryParse(text) ?? text;
        } else {
          body[f.key] = text;
        }
      }
    }
    Navigator.pop(context, body);
  }

  @override
  Widget build(BuildContext context) {
    final insets = MediaQuery.viewInsetsOf(context);
    return Padding(
      padding: EdgeInsets.only(bottom: insets.bottom),
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        minChildSize: 0.4,
        builder: (context, scrollController) {
          return Form(
            key: _formKey,
            child: ListView(
              controller: scrollController,
              padding: const EdgeInsets.all(20),
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                Text(widget.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                for (final f in _visibleFields) ...[
                  _buildField(f),
                  const SizedBox(height: 14),
                ],
                const SizedBox(height: 4),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(onPressed: _submit, child: const Text('Save')),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildField(ManagedField f) {
    if (f.type == ManagedFieldType.select) {
      final opts = widget.options[f.optionsKey] ?? const <SelectOption>[];
      return DropdownButtonFormField<int>(
        initialValue: _selectValues[f.key],
        isExpanded: true,
        decoration: InputDecoration(labelText: f.label + (f.required ? ' *' : ''), border: const OutlineInputBorder()),
        items: opts.map((o) => DropdownMenuItem(value: o.value, child: Text(o.label, overflow: TextOverflow.ellipsis))).toList(),
        onChanged: (v) => setState(() => _selectValues[f.key] = v),
        validator: f.required ? (v) => v == null ? '${f.label} required hai' : null : null,
      );
    }
    if (f.type == ManagedFieldType.stringSelect) {
      final opts = f.stringOptions ?? const <StringOption>[];
      return DropdownButtonFormField<String>(
        initialValue: _stringValues[f.key],
        isExpanded: true,
        decoration: InputDecoration(labelText: f.label + (f.required ? ' *' : ''), border: const OutlineInputBorder()),
        items: opts.map((o) => DropdownMenuItem(value: o.value, child: Text(o.label, overflow: TextOverflow.ellipsis))).toList(),
        onChanged: (v) => setState(() => _stringValues[f.key] = v),
        validator: f.required ? (v) => (v == null || v.isEmpty) ? '${f.label} required hai' : null : null,
      );
    }
    return TextFormField(
      controller: _controllers[f.key],
      keyboardType: f.type == ManagedFieldType.number ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.text,
      maxLines: f.type == ManagedFieldType.multiline ? 3 : 1,
      decoration: InputDecoration(labelText: f.label + (f.required ? ' *' : ''), border: const OutlineInputBorder()),
      validator: f.required ? (v) => (v == null || v.trim().isEmpty) ? '${f.label} required hai' : null : null,
    );
  }
}
