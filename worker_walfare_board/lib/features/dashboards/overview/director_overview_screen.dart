import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/format.dart';
import '../../../data/models/domain_models.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Director overview. Mirrors the website's DirectorDashboard summary: headline
/// metrics from `/dashboard/director` plus recent applications.
class DirectorOverviewScreen extends StatefulWidget {
  const DirectorOverviewScreen({super.key, this.onOpen});

  /// Optional callback to jump to another nav key (e.g. from a quick action).
  final void Function(String navKey)? onOpen;

  @override
  State<DirectorOverviewScreen> createState() => _DirectorOverviewScreenState();
}

class _DirectorOverviewScreenState extends State<DirectorOverviewScreen> {
  final _repo = ApiRepository.instance;
  bool _loading = true;
  String? _error;
  DashboardSummary _summary = DashboardSummary.empty();
  List<Application> _apps = const [];
  Map<int, Worker> _workers = const {};
  num _rentCollected = 0;

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
        _repo.dashboard('director'),
        _repo.applications(),
        _repo.workers(),
        _repo.rentInvoices(),
      ]);
      final rent = (r[3] as List<Map<String, dynamic>>).map((e) => RentInvoice(e)).toList();
      setState(() {
        _summary = DashboardSummary(r[0] as Map<String, dynamic>);
        _apps = (r[1] as List<Map<String, dynamic>>).map((e) => Application(e)).toList();
        _workers = {for (final w in (r[2] as List<Map<String, dynamic>>).map((e) => Worker(e))) w.id: w};
        _rentCollected = rent.fold<num>(0, (s, i) => s + i.paidAmount);
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

    final pending = _apps.where((a) => a.status.contains('pending') || a.status == 'under_verification').length;
    final recent = _apps.take(8).toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          MetricGrid(children: [
            MetricCard(title: 'Applications', value: '${_summary.applications}', hint: '$pending awaiting review', icon: Icons.description_outlined),
            MetricCard(title: 'Allottees', value: '${_summary.workers}', tone: MetricTone.green, hint: 'Registered workers', icon: Icons.groups_2_outlined),
            MetricCard(title: 'Total Units', value: '${_summary.flats}', tone: MetricTone.purple, hint: 'Residential units', icon: Icons.home_work_outlined),
            MetricCard(title: 'Rent Issues', value: '${_summary.rentUnpaid}', tone: MetricTone.amber, hint: '${money(_rentCollected)} collected', icon: Icons.payments_outlined),
            MetricCard(title: 'Open Work', value: '${_summary.complaints + _summary.utilityUnpaid}', tone: MetricTone.red, hint: '${_summary.complaints} complaints', icon: Icons.support_agent_outlined),
          ]),
          const SizedBox(height: 14),
          if (widget.onOpen != null)
            SectionCard(
              title: 'Quick Actions',
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _action('Applications', Icons.description_outlined, 'applications'),
                  _action('Rent', Icons.payments_outlined, 'rent'),
                  _action('Complaints', Icons.support_agent_outlined, 'complaints'),
                  _action('Evictions', Icons.gavel_outlined, 'evictions'),
                ],
              ),
            ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Recent Applications',
            subtitle: '${_apps.length} total',
            child: recent.isEmpty
                ? const EmptyHint('No applications yet.')
                : Column(
                    children: recent.map((a) {
                      final w = _workers[a.workerId];
                      return ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.assignment_outlined, color: AppColors.textSecondary),
                        title: Text(w?.name ?? 'Worker #${a.workerId}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Text('#${a.applicationNo}', style: const TextStyle(fontSize: 12)),
                        trailing: StatusPill(a.status),
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _action(String label, IconData icon, String navKey) {
    return ActionChip(
      avatar: Icon(icon, size: 18, color: AppColors.primary),
      label: Text(label),
      onPressed: () => widget.onOpen?.call(navKey),
    );
  }
}
