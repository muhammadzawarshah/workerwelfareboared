import 'json_parse.dart';

/// Formats a numeric/string amount as PKR currency, e.g. `Rs. 12,500`.
String money(dynamic value) {
  final n = asDouble(value);
  final whole = n.round();
  final s = whole.abs().toString();
  final buf = StringBuffer();
  for (int i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
    buf.write(s[i]);
  }
  return '${n < 0 ? '-' : ''}Rs. $buf';
}

/// `2026-06-10T...` -> `2026-06-10`.
String shortDate(dynamic value) {
  final s = asStr(value);
  if (s.length >= 10) return s.substring(0, 10);
  return s.isEmpty ? '-' : s;
}

/// `2026-06` from a billing month.
String monthLabel(dynamic value) {
  final s = asStr(value);
  if (s.length >= 7) return s.substring(0, 7);
  return s.isEmpty ? '-' : s;
}
