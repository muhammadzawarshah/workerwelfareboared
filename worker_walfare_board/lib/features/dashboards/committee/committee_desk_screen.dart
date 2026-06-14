import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/format.dart';
import '../../../data/models/domain_models.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Committee desk. The chairman / secretary only DECIDE here — approve or
/// reject. The flat assignment + allotment notification is done afterwards by
/// AD (Colonies) on the Allotment Desk.
class CommitteeDeskScreen extends StatefulWidget {
  const CommitteeDeskScreen({super.key});

  @override
  State<CommitteeDeskScreen> createState() => _CommitteeDeskScreenState();
}

class _CommitteeDeskScreenState extends State<CommitteeDeskScreen> {
  final _repo = ApiRepository.instance;
  bool _loading = true;
  String? _error;

  List<Application> _apps = const [];
  Map<int, Worker> _workers = const {};
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
      final r = await Future.wait([_repo.applications(), _repo.workers()]);
      setState(() {
        _apps = r[0].map((e) => Application(e)).toList();
        _workers = {for (final w in r[1].map((e) => Worker(e))) w.id: w};
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
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

    final committeeApps = _apps.where((a) => ['verified', 'committee_pending'].contains(a.status)).toList();
    final selected = _selectedId == null ? null : committeeApps.cast<Application?>().firstWhere((a) => a?.id == _selectedId, orElse: () => null);

    if (selected != null) {
      return _DecisionForm(
        app: selected,
        worker: _workers[selected.workerId],
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
            title: 'Committee Desk',
            subtitle: 'Approve ya reject. Flat assignment AD (Colonies) karega.',
            child: committeeApps.isEmpty
                ? const EmptyHint('No verified applications waiting for committee.')
                : Column(
                    children: committeeApps.map((a) {
                      final w = _workers[a.workerId];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(color: AppColors.surfaceMuted, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                        child: ListTile(
                          title: Text(w?.name ?? 'Worker #${a.workerId}', style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text('#${a.applicationNo} · ${w?.cnic ?? 'CNIC N/A'}', style: const TextStyle(fontSize: 12)),
                          trailing: const Icon(Icons.how_to_vote_outlined),
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

class _DecisionForm extends StatefulWidget {
  const _DecisionForm({required this.app, required this.worker, required this.onBack, required this.onDone});

  final Application app;
  final Worker? worker;
  final VoidCallback onBack;
  final VoidCallback onDone;

  @override
  State<_DecisionForm> createState() => _DecisionFormState();
}

class _DecisionFormState extends State<_DecisionForm> {
  final _repo = ApiRepository.instance;
  final _remarks = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _remarks.dispose();
    super.dispose();
  }

  Future<void> _approve() async {
    setState(() => _saving = true);
    try {
      await _repo.approveApplication(widget.app.id, remarks: _remarks.text.trim().isEmpty ? null : _remarks.text.trim());
      if (!mounted) return;
      showToast(context, 'Approved. AD (Colonies) ab flat assign + notification karega.', success: true);
      widget.onDone();
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      showToast(context, e.toString(), error: true);
    }
  }

  Future<void> _reject() async {
    setState(() => _saving = true);
    try {
      await _repo.rejectApplication(widget.app.id, reason: _remarks.text.trim().isEmpty ? 'Rejected by committee' : _remarks.text.trim());
      if (!mounted) return;
      showToast(context, 'Application reject ho gayi.', error: true);
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
          title: 'Committee Decision',
          subtitle: '#${widget.app.applicationNo} · ${widget.worker?.name ?? 'Worker #${widget.app.workerId}'}',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.surfaceMuted, borderRadius: BorderRadius.circular(10)),
                child: Column(children: [
                  Row(children: [
                    const Text('Basic Pay', style: TextStyle(color: AppColors.textSecondary)),
                    const Spacer(),
                    Text(money(widget.worker?.salaryPerMonth), style: const TextStyle(fontWeight: FontWeight.bold)),
                  ]),
                  const SizedBox(height: 6),
                  Row(children: [
                    const Text('Recommended Rent', style: TextStyle(color: AppColors.textSecondary)),
                    const Spacer(),
                    Text(money(widget.app.recommendedRentAmount), style: const TextStyle(fontWeight: FontWeight.bold)),
                  ]),
                ]),
              ),
              const SizedBox(height: 12),
              TextField(controller: _remarks, maxLines: 2, decoration: const InputDecoration(labelText: 'Committee Remarks', border: OutlineInputBorder())),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: OutlinedButton(onPressed: _saving ? null : _reject, child: const Text('Reject'))),
                  const SizedBox(width: 12),
                  Expanded(child: FilledButton(onPressed: _saving ? null : _approve, child: Text(_saving ? 'Saving...' : 'Approve'))),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
