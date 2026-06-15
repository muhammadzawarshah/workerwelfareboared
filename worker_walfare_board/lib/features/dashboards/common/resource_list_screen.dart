import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Generic, read-only list view over a backend resource. Mirrors the website's
/// `GenericManagementScreen` — used for notifications, attendance logs, GPS
/// pings, task proofs, allottees, etc.
class ResourceListScreen extends StatefulWidget {
  const ResourceListScreen({
    super.key,
    required this.title,
    required this.subtitle,
    required this.fetch,
    required this.titleOf,
    this.subtitleOf,
    this.statusOf,
    this.leading = Icons.list_alt_outlined,
  });

  final String title;
  final String subtitle;
  final Future<List<Map<String, dynamic>>> Function() fetch;
  final String Function(Map<String, dynamic>) titleOf;
  final String Function(Map<String, dynamic>)? subtitleOf;
  final String? Function(Map<String, dynamic>)? statusOf;
  final IconData leading;

  @override
  State<ResourceListScreen> createState() => _ResourceListScreenState();
}

class _ResourceListScreenState extends State<ResourceListScreen> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _rows = const [];

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
      final rows = await widget.fetch();
      setState(() {
        _rows = rows;
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

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(
            title: widget.title,
            subtitle: '${widget.subtitle} · ${_rows.length} records',
            child: _rows.isEmpty
                ? const EmptyHint('No records found.')
                : Column(
                    children: _rows.map((row) {
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

/// Factory helpers building common resource lists keyed by nav key.
class ResourceLists {
  const ResourceLists._();

  static final _repo = ApiRepository.instance;

  static Widget notifications() => ResourceListScreen(
        title: 'Notifications',
        subtitle: 'System updates',
        fetch: _repo.notifications,
        leading: Icons.notifications_outlined,
        titleOf: (r) => asStr(r['title'], 'Notification ${asStr(r['id'])}'),
        subtitleOf: (r) {
          final msg = asStr(r['message']);
          final stamp = r['sent_at'] ?? r['created_at'];
          final when = stamp == null ? '' : ' · ${shortDateOf(stamp)}';
          return '$msg$when';
        },
        statusOf: (r) => asStrN(r['status']),
      );

  static Widget attendance() => ResourceListScreen(
        title: 'Attendance Logs',
        subtitle: 'Caretaker duty sessions',
        fetch: _repo.caretakerAttendance,
        leading: Icons.fact_check_outlined,
        titleOf: (r) => 'Attendance #${asStr(r['id'])}',
        subtitleOf: (r) => '${shortDateOf(r['duty_date'])} · ${asStr(r['login_time']).replaceAll('T', ' ')}',
        statusOf: (r) => asStrN(r['status']),
      );

  static Widget gps() => ResourceListScreen(
        title: 'GPS Tracking',
        subtitle: 'Location pings',
        fetch: _repo.caretakerGps,
        leading: Icons.location_on_outlined,
        titleOf: (r) => 'Caretaker #${asStr(r['user_id'])}',
        subtitleOf: (r) {
          final lat = double.tryParse(asStr(r['latitude']));
          final lng = double.tryParse(asStr(r['longitude']));
          final coords = lat != null && lng != null ? '${lat.toStringAsFixed(5)}, ${lng.toStringAsFixed(5)}' : '${asStr(r['latitude'])}, ${asStr(r['longitude'])}';
          final at = asStr(r['recorded_at']);
          return '$coords · ${at.length >= 16 ? at.substring(0, 16).replaceAll('T', ' ') : at}';
        },
      );

  static Widget taskProofs() => ResourceListScreen(
        title: 'Task Proofs',
        subtitle: 'Submitted completion proofs',
        fetch: _repo.taskProofs,
        leading: Icons.image_outlined,
        titleOf: (r) => 'Proof #${asStr(r['id'])}',
        subtitleOf: (r) => asStr(r['remarks'], 'Task proof'),
      );

  static Widget allottees() => ResourceListScreen(
        title: 'Allottees / Workers',
        subtitle: 'Registered worker profiles',
        fetch: _repo.workers,
        leading: Icons.groups_2_outlined,
        titleOf: (r) => asStr(r['name'], 'Worker ${asStr(r['id'])}'),
        subtitleOf: (r) => '${asStr(r['cnic'], 'CNIC N/A')} · ${asStr(r['designation'], 'Worker')}',
        statusOf: (r) => asStrN(r['status']),
      );

  static Widget colonies() => ResourceListScreen(
        title: 'Colonies',
        subtitle: 'Managed colony locations',
        fetch: _repo.colonies,
        leading: Icons.location_city_outlined,
        titleOf: (r) => asStr(r['name'], 'Colony ${asStr(r['id'])}'),
        subtitleOf: (r) => asStr(r['address'], 'No address'),
      );

  static Widget units() => ResourceListScreen(
        title: 'Flats / Units',
        subtitle: 'Residential units',
        fetch: _repo.flats,
        leading: Icons.home_work_outlined,
        titleOf: (r) => '${asStr(r['flat_no'])} — ${asStr(r['flat_address'])}',
        subtitleOf: (r) => '${asStr(r['flat_rooms'], '-')} rooms',
        statusOf: (r) => asStrN(r['status']),
      );

  static Widget assets() => ResourceListScreen(
        title: 'Colony Assets',
        subtitle: 'Street lights, transformers & more',
        fetch: _repo.assets,
        leading: Icons.inventory_2_outlined,
        titleOf: (r) => asStr(r['name'], 'Asset ${asStr(r['id'])}'),
        subtitleOf: (r) => statusLabel(asStr(r['category'], 'other')),
      );

  static Widget staff() => ResourceListScreen(
        title: 'Staff',
        subtitle: 'System users',
        fetch: _repo.users,
        leading: Icons.badge_outlined,
        titleOf: (r) => asStr(r['name'], 'User ${asStr(r['id'])}'),
        subtitleOf: (r) => '${asStr(r['email'])} · ${statusLabel(asStr(r['role']))}',
        statusOf: (r) => asStrN(r['role']),
      );

  static String shortDateOf(dynamic v) {
    final s = asStr(v);
    return s.length >= 10 ? s.substring(0, 10) : s;
  }
}
