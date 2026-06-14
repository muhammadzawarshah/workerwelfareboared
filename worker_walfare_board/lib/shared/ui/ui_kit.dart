import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/utils/json_parse.dart';

/// Small, consistent building blocks shared by every role dashboard. Keeps the
/// existing Flutter look while matching the website's information layout.

class MetricCard extends StatelessWidget {
  const MetricCard({
    super.key,
    required this.title,
    required this.value,
    this.hint,
    this.tone = MetricTone.blue,
    this.icon,
  });

  final String title;
  final String value;
  final String? hint;
  final MetricTone tone;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final c = _toneColor(tone);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: c.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon ?? Icons.insights_outlined, color: c, size: 20),
              ),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          if (hint != null) ...[
            const SizedBox(height: 4),
            Text(hint!, style: const TextStyle(fontSize: 11, color: AppColors.textLight)),
          ],
        ],
      ),
    );
  }

  static Color _toneColor(MetricTone t) {
    switch (t) {
      case MetricTone.green:
        return AppColors.success;
      case MetricTone.amber:
        return AppColors.warning;
      case MetricTone.red:
        return AppColors.error;
      case MetricTone.purple:
        return const Color(0xFF8B5CF6);
      case MetricTone.blue:
        return AppColors.secondary;
    }
  }
}

enum MetricTone { blue, green, amber, red, purple }

/// Responsive grid of metric cards (2 per row on phones, more on wide screens).
class MetricGrid extends StatelessWidget {
  const MetricGrid({super.key, required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final cols = width >= 900 ? 4 : (width >= 600 ? 3 : 2);
    return GridView.count(
      crossAxisCount: cols,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.35,
      children: children,
    );
  }
}

class StatusPill extends StatelessWidget {
  const StatusPill(this.status, {super.key});
  final String status;

  @override
  Widget build(BuildContext context) {
    final c = _color(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        statusLabel(status),
        style: TextStyle(color: c, fontWeight: FontWeight.w700, fontSize: 11),
      ),
    );
  }

  static Color _color(String status) {
    final s = status.toLowerCase();
    if (['approved', 'paid', 'resolved', 'completed', 'verified', 'active', 'flat_assigned', 'vacated', 'passed'].contains(s)) {
      return AppColors.success;
    }
    if (['rejected', 'failed', 'overdue', 'cancelled', 'blocked', 'illegal_identified'].contains(s)) {
      return AppColors.error;
    }
    if (['pending', 'partial', 'under_verification', 'in_progress', 'assigned', 'committee_pending', 'processing', 'hearing_pending'].contains(s)) {
      return AppColors.warning;
    }
    return AppColors.secondary;
  }
}

/// A titled card section (mirrors the website's `data-card`).
class SectionCard extends StatelessWidget {
  const SectionCard({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
    required this.child,
  });

  final String title;
  final String? subtitle;
  final Widget? trailing;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(subtitle!, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ],
                ),
              ),
              if (trailing != null) trailing!,
            ],
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

/// Empty / muted text row.
class EmptyHint extends StatelessWidget {
  const EmptyHint(this.text, {super.key});
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: Center(child: Text(text, style: const TextStyle(color: AppColors.textLight))),
      );
}

/// Show a snackbar toast.
void showToast(BuildContext context, String message, {bool error = false, bool success = false}) {
  final color = error ? AppColors.error : (success ? AppColors.success : AppColors.primaryDark);
  ScaffoldMessenger.of(context)
    ..clearSnackBars()
    ..showSnackBar(SnackBar(content: Text(message), backgroundColor: color, behavior: SnackBarBehavior.floating));
}
