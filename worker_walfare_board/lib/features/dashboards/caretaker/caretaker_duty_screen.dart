import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/auth/auth_store.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/json_parse.dart';
import '../../../core/utils/location_helper.dart';
import '../../../data/models/domain_models.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Caretaker field-duty dashboard. Mirrors the website's CaretakerDutyDashboard:
/// start/end duty with GPS, live location, assigned tasks with proof upload
/// (radius-checked by the backend), and complaint filing.
class CaretakerDutyScreen extends StatefulWidget {
  const CaretakerDutyScreen({super.key});

  @override
  State<CaretakerDutyScreen> createState() => _CaretakerDutyScreenState();
}

class _CaretakerDutyScreenState extends State<CaretakerDutyScreen> {
  final _repo = ApiRepository.instance;
  final _user = AuthStore.instance.user!;

  bool _loading = true;
  String? _error;

  List<GpsPing> _gps = [];
  Map<String, dynamic>? _activeAttendance;
  int? _attendanceId;

  StreamSubscription<Position>? _watch;
  LatLng? _currentPos;

  bool get _dutyActive => _attendanceId != null || _activeAttendance != null;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _watch?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _repo.caretakerGps(userId: _user.id),
        _repo.caretakerAttendance(),
      ]);
      final gps = (results[0]).map((e) => GpsPing(e)).toList();
      final attendance = results[1];
      final active = attendance.cast<Map<String, dynamic>?>().firstWhere(
            (a) => a != null && asStr(a['status']) == 'active' && asStrN(a['logout_time']) == null,
            orElse: () => null,
          );
      setState(() {
        _gps = gps;
        _activeAttendance = active;
        if (active != null) _attendanceId = asIntN(active['id']);
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _startDuty() async {
    try {
      _toast('Getting current location...');
      final pos = await LocationHelper.current();
      setState(() => _currentPos = LatLng(pos.latitude, pos.longitude));
      final created = await _repo.attendanceLogin({
        'user_id': _user.id,
        'latitude': pos.latitude,
        'longitude': pos.longitude,
        'accuracy': pos.accuracy,
      });
      setState(() => _attendanceId = asIntN(created['id']));
      _startTracking();
      _toast('Duty start ho gayi — live location chal rahi hai.', success: true);
      _load();
    } catch (e) {
      _toast(e.toString(), error: true);
    }
  }

  Future<void> _endDuty() async {
    try {
      final id = _attendanceId ?? asIntN(_activeAttendance?['id']);
      if (id == null) {
        _toast('No active attendance found.', error: true);
        return;
      }
      final pos = await LocationHelper.current();
      await _repo.attendanceLogout({
        'attendance_id': id,
        'latitude': pos.latitude,
        'longitude': pos.longitude,
      });
      _watch?.cancel();
      setState(() {
        _attendanceId = null;
        _activeAttendance = null;
      });
      _toast('Duty complete ho gayi.', success: true);
      _load();
    } catch (e) {
      _toast(e.toString(), error: true);
    }
  }

  void _startTracking() {
    _watch?.cancel();
    _watch = LocationHelper.watch().listen((pos) {
      setState(() => _currentPos = LatLng(pos.latitude, pos.longitude));
      _repo.gpsPing({
        'user_id': _user.id,
        'attendance_id': _attendanceId,
        'latitude': pos.latitude,
        'longitude': pos.longitude,
        'accuracy': pos.accuracy,
      }).catchError((_) => null);
    });
  }

  void _toast(String m, {bool error = false, bool success = false}) =>
      showToast(context, m, error: error, success: success);

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return _ErrorRetry(error: _error!, onRetry: _load);
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          MetricGrid(children: [
            MetricCard(title: 'Active Duty', value: _dutyActive ? 'Active' : 'Off Duty', tone: MetricTone.green, hint: 'Attendance', icon: Icons.badge_outlined),
            MetricCard(title: 'GPS Pings', value: '${_gps.length}', tone: MetricTone.purple, hint: 'Location history', icon: Icons.location_on_outlined),
          ]),
          const SizedBox(height: 14),
          _dutyControls(),
          const SizedBox(height: 14),
          _mapCard(),
          const SizedBox(height: 14),
          _ComplaintCard(colonyId: _user.colonyId, onSubmitted: _load),
        ],
      ),
    );
  }

  Widget _dutyControls() {
    return SectionCard(
      title: 'Caretaker Duty Control',
      subtitle: _dutyActive ? 'Duty active — live location chal rahi hai.' : 'Start Duty dabayein — GPS tracking shuru ho jayegi.',
      child: Row(
        children: [
          Expanded(
            child: FilledButton.icon(
              onPressed: _dutyActive ? null : _startDuty,
              icon: const Icon(Icons.play_arrow),
              label: Text(_dutyActive ? 'Duty Active' : 'Start Duty'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: _dutyActive ? _endDuty : null,
              icon: const Icon(Icons.stop),
              label: const Text('End Duty'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _mapCard() {
    final center = _currentPos ?? (_gps.isNotEmpty ? LatLng(_gps.first.latitude, _gps.first.longitude) : const LatLng(34.0151, 71.5249));
    return SectionCard(
      title: 'Live Location',
      subtitle: _currentPos != null
          ? '${_currentPos!.latitude.toStringAsFixed(5)}, ${_currentPos!.longitude.toStringAsFixed(5)} · ${_gps.length} pings'
          : 'Duty start karein — location yahan dikhegi.',
      child: SizedBox(
        height: 240,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: FlutterMap(
            options: MapOptions(initialCenter: center, initialZoom: 15),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.wwb.worker_walfare_board',
              ),
              if (_gps.isNotEmpty)
                PolylineLayer(polylines: [
                  Polyline(
                    points: _gps.reversed.map((g) => LatLng(g.latitude, g.longitude)).toList(),
                    strokeWidth: 3,
                    color: AppColors.primary,
                  ),
                ]),
              MarkerLayer(markers: [
                if (_currentPos != null)
                  Marker(point: _currentPos!, width: 40, height: 40, child: const Icon(Icons.my_location, color: AppColors.secondary, size: 32)),
              ]),
            ],
          ),
        ),
      ),
    );
  }

}

// ── File complaint card ────────────────────────────────────────────────────────

class _ComplaintCard extends StatefulWidget {
  const _ComplaintCard({required this.colonyId, required this.onSubmitted});
  final int? colonyId;
  final VoidCallback onSubmitted;

  @override
  State<_ComplaintCard> createState() => _ComplaintCardState();
}

class _ComplaintCardState extends State<_ComplaintCard> {
  static const _assetCats = [
    ['street_light', 'Street Light'],
    ['transformer', 'Transformer'],
    ['tube_well', 'Tube Well'],
    ['generator', 'Generator'],
    ['water_tank', 'Water Tank'],
    ['sewerage_pump', 'Sewerage Pump'],
    ['road', 'Road / Pathway'],
    ['boundary_wall', 'Boundary Wall'],
    ['other', 'Other'],
  ];

  bool _open = false;
  bool _saving = false;
  String _type = 'asset';
  String _assetType = 'street_light';
  final _desc = TextEditingController();

  @override
  void dispose() {
    _desc.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_desc.text.trim().isEmpty) {
      showToast(context, 'Complaint description required.', error: true);
      return;
    }
    setState(() => _saving = true);
    try {
      LatLng? loc;
      if (_type == 'asset') {
        try {
          final pos = await LocationHelper.current();
          loc = LatLng(pos.latitude, pos.longitude);
        } catch (_) {/* location optional */}
      }
      final label = _assetCats.firstWhere((c) => c[0] == _assetType)[1];
      final descText = _type == 'asset' ? '[Asset: $label] ${_desc.text.trim()}' : _desc.text.trim();
      await ApiRepository.instance.createComplaint({
        'complaint_desc': descText,
        'complaint_type': _type,
        if (widget.colonyId != null) 'colony_id': widget.colonyId,
        if (loc != null) 'latitude': loc.latitude,
        if (loc != null) 'longitude': loc.longitude,
      });
      if (!mounted) return;
      setState(() {
        _desc.clear();
        _open = false;
        _saving = false;
        _type = 'asset';
        _assetType = 'street_light';
      });
      showToast(context, 'Complaint darj ho gayi.', success: true);
      widget.onSubmitted();
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      showToast(context, e.toString(), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Complaint File Karein',
      subtitle: 'Asset kharab ho ya general masla — admin ko forward ho jayegi.',
      trailing: TextButton(
        onPressed: () => setState(() => _open = !_open),
        child: Text(_open ? 'Cancel' : 'New'),
      ),
      child: !_open
          ? const SizedBox.shrink()
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
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
                TextField(
                  controller: _desc,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 14),
                FilledButton(
                  onPressed: _saving ? null : _submit,
                  child: Text(_saving ? 'Submitting...' : 'Complaint Submit Karein'),
                ),
              ],
            ),
    );
  }
}

// ── Shared small widgets ───────────────────────────────────────────────────────

class _ErrorRetry extends StatelessWidget {
  const _ErrorRetry({required this.error, required this.onRetry});
  final String error;
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.cloud_off_outlined, size: 44, color: AppColors.textLight),
            const SizedBox(height: 12),
            Text(error, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            FilledButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh), label: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}
