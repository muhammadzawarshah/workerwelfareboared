/// Safe parsing helpers for backend JSON.
///
/// The backend serializes `BigInt` and Prisma `Decimal` as **strings**, so
/// numeric fields (money, lat/lng, ids inside generic records) often arrive as
/// strings. These helpers coerce them safely.
library;

int? asIntN(dynamic v) {
  if (v == null) return null;
  if (v is int) return v;
  if (v is num) return v.toInt();
  return int.tryParse(v.toString());
}

int asInt(dynamic v, [int fallback = 0]) => asIntN(v) ?? fallback;

double? asDoubleN(dynamic v) {
  if (v == null) return null;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString());
}

double asDouble(dynamic v, [double fallback = 0]) => asDoubleN(v) ?? fallback;

String asStr(dynamic v, [String fallback = '']) {
  if (v == null) return fallback;
  return v.toString();
}

String? asStrN(dynamic v) => v?.toString();

bool asBool(dynamic v, [bool fallback = false]) {
  if (v == null) return fallback;
  if (v is bool) return v;
  final s = v.toString().toLowerCase();
  return s == 'true' || s == '1';
}

/// Coerce any backend list payload into a list of maps.
List<Map<String, dynamic>> asRows(dynamic v) {
  if (v is List) {
    return v.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
  }
  return const [];
}

/// Turn a snake_case enum/status string into a friendly "Title Case" label.
String statusLabel(dynamic value) {
  final s = asStr(value).trim();
  if (s.isEmpty) return '-';
  return s
      .split(RegExp(r'[_\s]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => '${w[0].toUpperCase()}${w.substring(1)}')
      .join(' ');
}
