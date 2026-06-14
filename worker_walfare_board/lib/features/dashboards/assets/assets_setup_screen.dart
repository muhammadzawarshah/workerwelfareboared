import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/json_parse.dart';
import '../../../core/utils/location_helper.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Assets admin setup. Mirrors the website's AssetsAdminDashboard: create
/// colonies, flats and colony assets (each with an optional GPS location), and
/// see live counts.
class AssetsSetupScreen extends StatefulWidget {
  const AssetsSetupScreen({super.key});

  @override
  State<AssetsSetupScreen> createState() => _AssetsSetupScreenState();
}

class _AssetsSetupScreenState extends State<AssetsSetupScreen> {
  final _repo = ApiRepository.instance;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _colonies = const [];
  List<Map<String, dynamic>> _flats = const [];
  List<Map<String, dynamic>> _assets = const [];

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
      final r = await Future.wait([_repo.colonies(), _repo.flats(), _repo.assets()]);
      setState(() {
        _colonies = r[0];
        _flats = r[1];
        _assets = r[2];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  int _countCategory(String c) => _assets.where((a) => asStr(a['category']) == c).length;

  Future<void> _addColony() async {
    final data = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _EntitySheet(kind: _EntityKind.colony),
    );
    if (data == null) return;
    await _create(() => _repo.createColony(data), 'Colony');
  }

  Future<void> _addFlat() async {
    if (_colonies.isEmpty) {
      showToast(context, 'Pehle koi colony banayein.', error: true);
      return;
    }
    final data = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _EntitySheet(kind: _EntityKind.flat, colonies: _colonies),
    );
    if (data == null) return;
    await _create(() => _repo.createFlat(data), 'Flat');
  }

  Future<void> _addAsset() async {
    if (_colonies.isEmpty) {
      showToast(context, 'Pehle koi colony banayein.', error: true);
      return;
    }
    final data = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _EntitySheet(kind: _EntityKind.asset, colonies: _colonies),
    );
    if (data == null) return;
    await _create(() => _repo.createAsset(data), 'Asset');
  }

  Future<void> _create(Future<Map<String, dynamic>> Function() action, String label) async {
    try {
      await action();
      if (!mounted) return;
      showToast(context, '$label ban gaya.', success: true);
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

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          MetricGrid(children: [
            MetricCard(title: 'Colonies', value: '${_colonies.length}', icon: Icons.location_city_outlined),
            MetricCard(title: 'Flats', value: '${_flats.length}', tone: MetricTone.green, icon: Icons.home_work_outlined),
            MetricCard(title: 'Street Lights', value: '${_countCategory('street_light')}', tone: MetricTone.amber, icon: Icons.lightbulb_outline),
            MetricCard(title: 'Transformers', value: '${_countCategory('transformer')}', tone: MetricTone.purple, icon: Icons.electrical_services_outlined),
          ]),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Assets Admin Dashboard',
            subtitle: 'Colonies, flats aur assets banayein (GPS ke saath).',
            child: Column(
              children: [
                _addRow('Add Colony', Icons.location_city_outlined, _addColony),
                const SizedBox(height: 8),
                _addRow('Add Flat', Icons.home_work_outlined, _addFlat),
                const SizedBox(height: 8),
                _addRow('Add Asset', Icons.inventory_2_outlined, _addAsset),
              ],
            ),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Assets Register',
            subtitle: '${_assets.length} assets',
            child: _assets.isEmpty
                ? const EmptyHint('No assets yet.')
                : Column(
                    children: _assets.take(20).map((a) => ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          leading: const Icon(Icons.inventory_2_outlined, color: AppColors.textSecondary),
                          title: Text(asStr(a['name'], 'Asset ${asStr(a['id'])}'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: Text(statusLabel(asStr(a['category'], 'other')), style: const TextStyle(fontSize: 12)),
                          trailing: a['latitude'] != null ? const Icon(Icons.location_on, size: 16, color: AppColors.success) : null,
                        )).toList(),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _addRow(String label, IconData icon, VoidCallback onTap) {
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(icon),
      label: Align(alignment: Alignment.centerLeft, child: Text(label)),
      style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48), alignment: Alignment.centerLeft),
    );
  }
}

// ── Entity create sheet (colony / flat / asset) ────────────────────────────────

enum _EntityKind { colony, flat, asset }

class _EntitySheet extends StatefulWidget {
  const _EntitySheet({required this.kind, this.colonies = const []});
  final _EntityKind kind;
  final List<Map<String, dynamic>> colonies;

  @override
  State<_EntitySheet> createState() => _EntitySheetState();
}

class _EntitySheetState extends State<_EntitySheet> {
  static const _assetCats = [
    ['street_light', 'Street Light'],
    ['transformer', 'Transformer'],
    ['tube_well', 'Tube Well'],
    ['generator', 'Generator'],
    ['water_tank', 'Water Tank'],
    ['other', 'Other'],
  ];

  final _name = TextEditingController();
  final _address = TextEditingController();
  final _flatNo = TextEditingController();
  final _rooms = TextEditingController(text: '2');
  int? _colonyId;
  String _category = 'street_light';
  double? _lat, _lng;
  bool _gettingLoc = false;

  @override
  void dispose() {
    _name.dispose();
    _address.dispose();
    _flatNo.dispose();
    _rooms.dispose();
    super.dispose();
  }

  Future<void> _useLocation() async {
    setState(() => _gettingLoc = true);
    try {
      final pos = await LocationHelper.current();
      setState(() {
        _lat = pos.latitude;
        _lng = pos.longitude;
      });
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _gettingLoc = false);
    }
  }

  void _submit() {
    switch (widget.kind) {
      case _EntityKind.colony:
        if (_name.text.trim().isEmpty || _address.text.trim().isEmpty) {
          showToast(context, 'Name aur address required.', error: true);
          return;
        }
        Navigator.pop(context, {
          'name': _name.text.trim(),
          'address': _address.text.trim(),
          if (_lat != null) 'latitude': _lat,
          if (_lng != null) 'longitude': _lng,
        });
      case _EntityKind.flat:
        if (_colonyId == null || _flatNo.text.trim().isEmpty || _address.text.trim().isEmpty) {
          showToast(context, 'Colony, flat no aur address required.', error: true);
          return;
        }
        Navigator.pop(context, {
          'colony_id': _colonyId,
          'flat_no': _flatNo.text.trim(),
          'flat_address': _address.text.trim(),
          'flat_rooms': int.tryParse(_rooms.text.trim()) ?? 0,
          'status': 'empty',
          if (_lat != null) 'latitude': _lat,
          if (_lng != null) 'longitude': _lng,
        });
      case _EntityKind.asset:
        if (_colonyId == null || _name.text.trim().isEmpty) {
          showToast(context, 'Colony aur asset name required.', error: true);
          return;
        }
        Navigator.pop(context, {
          'colony_id': _colonyId,
          'category': _category,
          'name': _name.text.trim(),
          if (_address.text.trim().isNotEmpty) 'address': _address.text.trim(),
          if (_lat != null) 'latitude': _lat,
          if (_lng != null) 'longitude': _lng,
        });
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = switch (widget.kind) {
      _EntityKind.colony => 'Add Colony',
      _EntityKind.flat => 'Add Flat',
      _EntityKind.asset => 'Add Asset',
    };
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SingleChildScrollView(
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              if (widget.kind != _EntityKind.colony)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: DropdownButtonFormField<int>(
                    initialValue: _colonyId,
                    isExpanded: true,
                    decoration: const InputDecoration(labelText: 'Colony', border: OutlineInputBorder()),
                    items: widget.colonies.map((c) => DropdownMenuItem(value: asInt(c['id']), child: Text(asStr(c['name'], 'Colony #${asStr(c['id'])}')))).toList(),
                    onChanged: (v) => setState(() => _colonyId = v),
                  ),
                ),
              if (widget.kind == _EntityKind.asset)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: DropdownButtonFormField<String>(
                    initialValue: _category,
                    decoration: const InputDecoration(labelText: 'Asset Type', border: OutlineInputBorder()),
                    items: _assetCats.map((c) => DropdownMenuItem(value: c[0], child: Text(c[1]))).toList(),
                    onChanged: (v) => setState(() => _category = v ?? 'street_light'),
                  ),
                ),
              if (widget.kind == _EntityKind.flat) ...[
                TextField(controller: _flatNo, decoration: const InputDecoration(labelText: 'Flat No', border: OutlineInputBorder())),
                const SizedBox(height: 12),
                TextField(controller: _rooms, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Rooms', border: OutlineInputBorder())),
                const SizedBox(height: 12),
              ] else ...[
                TextField(controller: _name, decoration: InputDecoration(labelText: widget.kind == _EntityKind.colony ? 'Colony Name' : 'Asset Name / No', border: const OutlineInputBorder())),
                const SizedBox(height: 12),
              ],
              TextField(
                controller: _address,
                maxLines: widget.kind == _EntityKind.colony ? 2 : 1,
                decoration: InputDecoration(labelText: widget.kind == _EntityKind.asset ? 'Address / Notes' : (widget.kind == _EntityKind.flat ? 'Flat Address' : 'Address'), border: const OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _gettingLoc ? null : _useLocation,
                icon: const Icon(Icons.my_location),
                label: Text(_lat != null ? 'Location: ${_lat!.toStringAsFixed(5)}, ${_lng!.toStringAsFixed(5)}' : (_gettingLoc ? 'Getting...' : 'Use Current Location')),
              ),
              const SizedBox(height: 16),
              FilledButton(onPressed: _submit, child: Text(title)),
            ],
          ),
        ),
      ),
    );
  }
}
