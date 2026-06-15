import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/utils/format.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/models/domain_models.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Finance accounts overview. Mirrors the website's AccountsDashboard summary:
/// rent due/collected, utility due/paid, and recent receipts.
class AccountsScreen extends StatefulWidget {
  const AccountsScreen({super.key});

  @override
  State<AccountsScreen> createState() => _AccountsScreenState();
}

class _AccountsScreenState extends State<AccountsScreen> {
  final _repo = ApiRepository.instance;
  bool _loading = true;
  String? _error;

  // Report period filter (mirrors the website's monthly/quarterly/yearly).
  String _period = 'all';
  bool _inPeriod(String? bm) {
    if (_period == 'all' || bm == null || bm.isEmpty) return true;
    final d = DateTime.tryParse(bm);
    if (d == null) return true;
    final now = DateTime.now();
    switch (_period) {
      case 'year':
        return d.year == now.year;
      case 'month':
        return d.year == now.year && d.month == now.month;
      case 'quarter':
        return d.year == now.year && ((d.month - 1) ~/ 3) == ((now.month - 1) ~/ 3);
      default:
        return true;
    }
  }

  List<RentInvoice> _rent = const [];
  List<Map<String, dynamic>> _rentPayments = const [];
  List<Map<String, dynamic>> _utilities = const [];
  List<Map<String, dynamic>> _utilityPayments = const [];
  Map<int, Worker> _workers = const {};
  List<Map<String, dynamic>> _collectionSummary = const [];
  List<Map<String, dynamic>> _byWorker = const [];
  List<Map<String, dynamic>> _byColony = const [];

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
        _repo.rentInvoices(),
        _repo.rentPayments(),
        _repo.utilityBills(),
        _repo.utilityPayments(),
        _repo.workers(),
        _repo.rentCollectionSummary(),
        _repo.rentCollectionByWorker(),
        _repo.rentCollectionByColony(),
      ]);
      setState(() {
        _rent = r[0].map((e) => RentInvoice(e)).toList();
        _rentPayments = r[1];
        _utilities = r[2];
        _utilityPayments = r[3];
        _workers = {for (final w in r[4].map((e) => Worker(e))) w.id: w};
        _collectionSummary = r[5];
        _byWorker = r[6];
        _byColony = r[7];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _collectRemittance(int caretakerId, String name, String amount) async {
    final now = DateTime.now();
    final month = '${now.year}-${now.month.toString().padLeft(2, '0')}';
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Generate Voucher'),
        content: Text('$name ke liye $month ka handover voucher generate karein? Caretaker cash de kar screenshot lagayega.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Generate')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await _repo.generateRemittanceVoucher(caretakerUserId: caretakerId, billingMonth: '$month-01');
      if (!mounted) return;
      showToast(context, 'Voucher generate ho gaya — caretaker ko notify kar diya.', success: true);
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

    final filteredRent = _rent.where((r) => _inPeriod(r.billingMonth)).toList();
    final rentTotal = filteredRent.fold<num>(0, (s, r) => s + r.totalAmount);
    final rentPaid = filteredRent.fold<num>(0, (s, r) => s + r.paidAmount);
    final rentDue = (rentTotal - rentPaid).clamp(0, double.infinity);
    final rentCollected = rentPaid;
    final utilDue = _utilities
        .where((b) => !['paid', 'cancelled', 'not_generated'].contains(asStr(b['status'])))
        .fold<num>(0, (s, b) => s + asDouble(b['total_amount']));
    final utilPaid = _utilityPayments.fold<num>(0, (s, p) => s + asDouble(p['amount']));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          MetricGrid(children: [
            MetricCard(title: 'Rent Due', value: money(rentDue), tone: MetricTone.amber, icon: Icons.schedule_outlined),
            MetricCard(title: 'Rent Collected', value: money(rentCollected > 0 ? rentCollected : rentPaid), tone: MetricTone.green, icon: Icons.payments_outlined),
            MetricCard(title: 'Utility Due', value: money(utilDue), tone: MetricTone.red, icon: Icons.bolt_outlined),
            MetricCard(title: 'Utility Paid', value: money(utilPaid), tone: MetricTone.purple, icon: Icons.receipt_outlined),
          ]),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              ['all', 'All Time'],
              ['month', 'This Month'],
              ['quarter', 'This Quarter'],
              ['year', 'This Year'],
            ].map((opt) => ChoiceChip(
                  label: Text(opt[1]),
                  selected: _period == opt[0],
                  onSelected: (_) => setState(() => _period = opt[0]),
                )).toList(),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Recent Rent Receipts',
            subtitle: 'Latest payments received',
            child: _rentPayments.isEmpty
                ? const EmptyHint('No rent payments found.')
                : Column(
                    children: _rentPayments.take(10).map((p) {
                      final inv = _rent.cast<RentInvoice?>().firstWhere((r) => r?.id == asIntN(p['rent_invoice_id']), orElse: () => null);
                      final w = inv != null ? _workers[inv.workerId] : null;
                      return ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.payments_outlined, color: AppColors.success),
                        title: Text(asStr(p['receipt_no'], 'Payment #${asStr(p['id'])}'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Text('${w?.name ?? 'Worker'} · ${statusLabel(asStr(p['payment_method'], 'manual'))}', style: const TextStyle(fontSize: 12)),
                        trailing: Text(money(p['amount']), style: const TextStyle(fontWeight: FontWeight.w700)),
                      );
                    }).toList(),
                  ),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Outstanding Rent',
            subtitle: 'Invoices needing follow-up',
            child: () {
              final outstanding = _rent.where((r) => !['paid', 'cancelled'].contains(r.status)).take(10).toList();
              if (outstanding.isEmpty) return const EmptyHint('No outstanding balances.');
              return Column(
                children: outstanding.map((inv) {
                  final w = _workers[inv.workerId];
                  return ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.account_balance_wallet_outlined, color: AppColors.warning),
                    title: Text(w?.name ?? 'Worker #${inv.workerId}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: Text('Invoice #${inv.id} · ${monthLabel(inv.billingMonth)}', style: const TextStyle(fontSize: 12)),
                    trailing: Text(money(inv.balance), style: const TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
                  );
                }).toList(),
              );
            }(),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Caretaker Collections (Pending Handover)',
            subtitle: 'Har caretaker ke paas kitna cash hai — voucher generate karein',
            child: _collectionSummary.isEmpty
                ? const EmptyHint('Koi pending collection nahi.')
                : Column(
                    children: _collectionSummary.map((row) {
                      final caretaker = row['caretaker'] as Map<String, dynamic>?;
                      final id = asIntN(row['caretaker_user_id']);
                      final name = asStr(caretaker?['name'], 'Caretaker #${asStr(row['caretaker_user_id'])}');
                      final amount = asStr(row['amount'], '0');
                      return ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.account_balance_wallet_outlined, color: AppColors.warning),
                        title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Text('${asStr(row['payment_count'], '0')} payments', style: const TextStyle(fontSize: 12)),
                        trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                          Text(money(amount), style: const TextStyle(fontWeight: FontWeight.w700)),
                          const SizedBox(width: 8),
                          if (id != null && (num.tryParse(amount) ?? 0) > 0)
                            FilledButton(
                              onPressed: () => _collectRemittance(id, name, amount),
                              style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), minimumSize: Size.zero),
                              child: const Text('Voucher'),
                            ),
                        ]),
                      );
                    }).toList(),
                  ),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Collection by Colony',
            subtitle: 'Kis colony ne kitna jama karaya',
            child: _byColony.isEmpty
                ? const EmptyHint('No colony data.')
                : Column(children: _byColony.map((row) => _breakdownTile(asStr((row['colony'] as Map<String, dynamic>?)?['name'], 'Colony #${asStr(row['colony_id'])}'), row)).toList()),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Collection by Worker',
            subtitle: 'Kis worker ne kitna pay kiya',
            child: _byWorker.isEmpty
                ? const EmptyHint('No worker data.')
                : Column(children: _byWorker.take(25).map((row) => _breakdownTile(asStr((row['worker'] as Map<String, dynamic>?)?['name'], 'Worker #${asStr(row['worker_id'])}'), row)).toList()),
          ),
        ],
      ),
    );
  }

  Widget _breakdownTile(String name, Map<String, dynamic> row) {
    return ListTile(
      dense: true,
      contentPadding: EdgeInsets.zero,
      title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
      subtitle: Text('Billed ${money(row['billed'])} · Outstanding ${money(row['outstanding'])}', style: const TextStyle(fontSize: 12)),
      trailing: Text(money(row['collected']), style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.success)),
    );
  }
}
