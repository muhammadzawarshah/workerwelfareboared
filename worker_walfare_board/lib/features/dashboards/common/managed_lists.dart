import 'package:flutter/material.dart';

import '../../../core/auth/auth_store.dart';
import '../../../core/constants/app_roles.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/services/api_repository.dart';
import 'managed_resource_screen.dart';

/// Builds the manageable (create/edit/delete) list screens, keyed by nav key.
/// Whether the current user can mutate is decided by [_can] (super_admin/admin
/// always can — mirrors the backend `canAccess`).
class ManagedLists {
  const ManagedLists._();

  static final _repo = ApiRepository.instance;

  static String get _role => AuthStore.instance.user?.role ?? '';

  static bool _can(List<String> allowed) =>
      _role == AppRoles.superAdmin || _role == AppRoles.admin || allowed.contains(_role);

  /// Fetch a resource and map it into dropdown [SelectOption]s (id → label).
  static Future<List<SelectOption>> _opts(
    Future<List<Map<String, dynamic>>> Function() fetch,
    String labelKey, {
    String idKey = 'id',
  }) async {
    final rows = await fetch();
    return rows
        .map((r) => SelectOption(asInt(r[idKey]), asStr(r[labelKey], '#${asStr(r[idKey])}')))
        .toList();
  }

  static List<StringOption> _roleOptions() {
    final roles = <String>[AppRoles.superAdmin, AppRoles.admin, ...AppRoles.supported];
    return roles.map((r) => StringOption(r, AppRoles.label(r))).toList();
  }

  // ── Zones ──────────────────────────────────────────────────────────────────
  static Widget zones() => ManagedResourceScreen(
        title: 'Zone',
        subtitle: 'Operational zones',
        path: '/zones',
        leading: Icons.map_outlined,
        fetch: _repo.zones,
        canManage: _can([AppRoles.directorAdmin, AppRoles.adColoniesZone1, AppRoles.adColoniesZone2]),
        titleOf: (r) => asStr(r['name'], 'Zone #${asStr(r['id'])}'),
        subtitleOf: (r) => r['ad_user_id'] == null ? 'No Assistant Director assigned' : 'AD assigned (user #${asStr(r['ad_user_id'])})',
        fields: const [
          ManagedField('name', 'Zone Name', required: true),
          ManagedField('ad_user_id', 'Assistant Director', type: ManagedFieldType.select, optionsKey: 'users'),
        ],
        relatedLoader: () async => {'users': await _opts(_repo.users, 'name')},
      );

  // ── Colonies ───────────────────────────────────────────────────────────────
  static Widget colonies() => ManagedResourceScreen(
        title: 'Colony',
        subtitle: 'Managed colony locations',
        path: '/colonies',
        leading: Icons.location_city_outlined,
        fetch: _repo.colonies,
        canManage: _can([AppRoles.directorAdmin, AppRoles.adColoniesZone1, AppRoles.adColoniesZone2, AppRoles.colonySection]),
        titleOf: (r) => asStr(r['name'], 'Colony #${asStr(r['id'])}'),
        subtitleOf: (r) => asStr(r['address'], 'No address'),
        fields: const [
          ManagedField('name', 'Colony Name', required: true),
          ManagedField('address', 'Address', type: ManagedFieldType.multiline, required: true),
          ManagedField('zone_id', 'Zone', type: ManagedFieldType.select, optionsKey: 'zones'),
          ManagedField('district_id', 'District', type: ManagedFieldType.select, optionsKey: 'districts'),
          ManagedField('latitude', 'Latitude', type: ManagedFieldType.number),
          ManagedField('longitude', 'Longitude', type: ManagedFieldType.number),
        ],
        relatedLoader: () async => {
          'zones': await _opts(_repo.zones, 'name'),
          'districts': await _opts(_repo.districts, 'name'),
        },
      );

  // ── Districts ──────────────────────────────────────────────────────────────
  static Widget districts() => ManagedResourceScreen(
        title: 'District',
        subtitle: 'Administrative districts',
        path: '/districts',
        leading: Icons.public_outlined,
        fetch: _repo.districts,
        canManage: _can([AppRoles.directorAdmin, AppRoles.colonySection]),
        titleOf: (r) => asStr(r['name'], 'District #${asStr(r['id'])}'),
        fields: const [
          ManagedField('name', 'District Name', required: true),
        ],
      );

  // ── Residential units / flats ────────────────────────────────────────────────
  static Widget units() => ManagedResourceScreen(
        title: 'Unit',
        subtitle: 'Residential units / flats',
        path: '/residential-units',
        leading: Icons.home_work_outlined,
        fetch: _repo.flats,
        canManage: _can([
          AppRoles.directorAdmin,
          AppRoles.adColoniesZone1,
          AppRoles.adColoniesZone2,
          AppRoles.colonySection,
          AppRoles.careTakerLabourColony,
        ]),
        titleOf: (r) => '${asStr(r['flat_no'], 'Unit')} — ${asStr(r['flat_address'], '')}',
        subtitleOf: (r) => '${asStr(r['flat_rooms'], '-')} rooms',
        statusOf: (r) => asStrN(r['status']),
        fields: const [
          ManagedField('flat_no', 'Flat / Unit No', required: true),
          ManagedField('flat_address', 'Address', type: ManagedFieldType.multiline, required: true),
          ManagedField('colony_id', 'Colony', type: ManagedFieldType.select, optionsKey: 'colonies', required: true),
          ManagedField('flat_rooms', 'Rooms', type: ManagedFieldType.number),
          ManagedField('latitude', 'Latitude', type: ManagedFieldType.number),
          ManagedField('longitude', 'Longitude', type: ManagedFieldType.number),
        ],
        relatedLoader: () async => {'colonies': await _opts(_repo.colonies, 'name')},
      );

  // ── Assets ─────────────────────────────────────────────────────────────────
  static Widget assets() => ManagedResourceScreen(
        title: 'Asset',
        subtitle: 'Colony assets (lights, transformers, etc.)',
        path: '/assets',
        leading: Icons.inventory_2_outlined,
        fetch: _repo.assets,
        canManage: _can([AppRoles.directorAdmin, AppRoles.worksWing]),
        titleOf: (r) => asStr(r['name'], 'Asset #${asStr(r['id'])}'),
        subtitleOf: (r) => statusLabel(asStr(r['category'], 'other')),
        fields: const [
          ManagedField('name', 'Asset Name', required: true),
          ManagedField('category', 'Category'),
          ManagedField('address', 'Address', type: ManagedFieldType.multiline),
          ManagedField('colony_id', 'Colony', type: ManagedFieldType.select, optionsKey: 'colonies'),
          ManagedField('latitude', 'Latitude', type: ManagedFieldType.number),
          ManagedField('longitude', 'Longitude', type: ManagedFieldType.number),
        ],
        relatedLoader: () async => {'colonies': await _opts(_repo.colonies, 'name')},
      );

  // ── Staff / users ────────────────────────────────────────────────────────────
  static Widget staff() => ManagedResourceScreen(
        title: 'Staff',
        subtitle: 'System users & roles',
        path: '/users',
        leading: Icons.badge_outlined,
        fetch: _repo.users,
        canManage: _can([AppRoles.directorAdmin, AppRoles.deputyDirectorGahr]),
        titleOf: (r) => asStr(r['name'], 'User #${asStr(r['id'])}'),
        subtitleOf: (r) => '${asStr(r['email'])} · ${statusLabel(asStr(r['role']))}',
        statusOf: (r) => asStrN(r['status']),
        fields: [
          const ManagedField('name', 'Full Name', required: true),
          const ManagedField('email', 'Email', required: true),
          const ManagedField('phone_number', 'Phone (03xxxxxxxxx)'),
          ManagedField('role', 'Role', type: ManagedFieldType.stringSelect, required: true, stringOptions: _roleOptions()),
          // Min 12 chars incl. upper, lower, digit (enforced by the backend).
          const ManagedField('password', 'Password', required: true, createOnly: true),
        ],
      );
}
