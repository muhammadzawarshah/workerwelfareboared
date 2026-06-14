import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../../../core/auth/auth_store.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_roles.dart';
import '../../../core/utils/format.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/models/domain_models.dart';
import '../../../data/services/api_repository.dart';
import '../../../shared/ui/ui_kit.dart';

/// Rent collection register. Mirrors the website's RentDashboard: invoice list,
/// collect payment (cash or non-cash with proof), and (for finance/director)
/// generate monthly invoices.
class RentScreen extends StatefulWidget {
  const RentScreen({super.key});

  @override
  State<RentScreen> createState() => _RentScreenState();
}

class _RentScreenState extends State<RentScreen> {
  final _repo = ApiRepository.instance;
  final _role = AuthStore.instance.user!.role;

  bool _loading = true;
  String? _error;
  List<RentInvoice> _rent = const [];
  Map<int, Worker> _workers = const {};
  List<Map<String, dynamic>> _docTypes = const [];
  List<Map<String, dynamic>> _myPending = const [];
  String _query = '';

  // Generation is the accountant's job — the caretaker only collects.
  bool get _canGenerate => [
        AppRoles.superAdmin,
        AppRoles.admin,
        AppRoles.directorAdmin,
        AppRoles.financeWing,
        AppRoles.recoveriesRent,
      ].contains(_role);

  bool get _isCaretaker => _role == AppRoles.careTakerLabourColony;

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
      final results = await Future.wait([
        _repo.rentInvoices(),
        _repo.workers(),
        _repo.documentTypes(),
        if (_isCaretaker) _repo.myPendingCollection() else Future.value(<Map<String, dynamic>>[]),
      ]);
      setState(() {
        _rent = results[0].map((e) => RentInvoice(e)).toList();
        _workers = {for (final w in results[1].map((e) => Worker(e))) w.id: w};
        _docTypes = results[2];
        _myPending = results[3];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  int? _findDocTypeId(List<String> terms) {
    for (final t in _docTypes) {
      final hay = '${asStr(t['name'])} ${asStr(t['code'])}'.toLowerCase();
      if (terms.any((term) => hay.contains(term))) return asIntN(t['id']);
    }
    return null;
  }

  Future<void> _collect(RentInvoice inv) async {
    final result = await showModalBottomSheet<_PaymentData>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _CollectSheet(due: inv.balance),
    );
    if (result == null) return;
    final proofTypeId = result.method != 'cash' ? _findDocTypeId(['rent payment proof', 'payment proof', 'receipt', 'proof']) : null;
    if (result.method != 'cash' && result.proof != null && proofTypeId == null) {
      if (mounted) showToast(context, 'Rent payment proof document type missing.', error: true);
      return;
    }
    try {
      final payment = await _repo.payRentInvoice(
        inv.id,
        amount: result.amount,
        paymentDate: DateTime.now().toIso8601String().substring(0, 10),
        paymentMethod: result.method,
        receiptNo: result.receiptNo,
      );
      if (result.method != 'cash' && result.proof != null && proofTypeId != null) {
        await _repo.uploadDocument(
          file: result.proof!,
          documentTypeId: proofTypeId,
          ownerType: 'rent_payment',
          ownerId: asIntN(payment['id']),
          visibility: 'finance',
          remarks: 'Rent ${result.method} proof for invoice #${inv.id}',
        );
      }
      if (!mounted) return;
      showToast(context, 'Rent payment recorded.', success: true);
      _load();
    } catch (e) {
      if (!mounted) return;
      showToast(context, e.toString(), error: true);
    }
  }

  Future<void> _generate() async {
    final now = DateTime.now();
    final month = DateTime(now.year, now.month, 1).toIso8601String().substring(0, 10);
    final due = DateTime(now.year, now.month, 5).toIso8601String().substring(0, 10);
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Generate Monthly Rent'),
        content: Text('Billing month $month ke liye sab active assignments ke invoices banayein?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Generate')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await _repo.generateRentInvoices(billingMonth: month, dueDate: due);
      if (!mounted) return;
      showToast(context, 'Rent invoices generated.', success: true);
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

    final total = _rent.fold<num>(0, (s, i) => s + i.totalAmount);
    final paid = _rent.fold<num>(0, (s, i) => s + i.paidAmount);
    final pending = total - paid;
    final filtered = _rent.where((inv) {
      if (_query.isEmpty) return true;
      final w = _workers[inv.workerId];
      final hay = '${w?.name ?? ''} ${w?.cnic ?? ''} ${inv.status} ${inv.billingMonth}'.toLowerCase();
      return hay.contains(_query.toLowerCase());
    }).toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          MetricGrid(children: [
            MetricCard(title: 'Total Rent', value: money(total), icon: Icons.receipt_long_outlined),
            MetricCard(title: 'Collected', value: money(paid), tone: MetricTone.green, icon: Icons.payments_outlined),
            MetricCard(title: 'Pending', value: money(pending < 0 ? 0 : pending), tone: MetricTone.amber, icon: Icons.schedule_outlined),
            MetricCard(title: 'Defaulters', value: '${_rent.where((i) => ['unpaid', 'overdue'].contains(i.status)).length}', tone: MetricTone.red, icon: Icons.warning_amber_outlined),
          ]),
          const SizedBox(height: 14),
          if (_canGenerate)
            Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: FilledButton.icon(onPressed: _generate, icon: const Icon(Icons.add), label: const Text('Generate Monthly Rent')),
            ),
          if (_isCaretaker) ...[
            Builder(builder: (_) {
              final pendingTotal = _myPending.fold<num>(0, (s, p) => s + (num.tryParse(asStr(p['amount'], '0')) ?? 0));
              return SectionCard(
                title: 'Aapki Pending Collection',
                subtitle: 'Accountant ko handover ke liye',
                child: Row(
                  children: [
                    _kv('Payments', '${_myPending.length}', AppColors.secondary),
                    const SizedBox(width: 20),
                    _kv('Cash in hand', money(pendingTotal), AppColors.warning),
                  ],
                ),
              );
            }),
            const SizedBox(height: 14),
          ],
          SectionCard(
            title: 'Rent Collection Register',
            subtitle: '${filtered.length} invoices',
            child: Column(
              children: [
                TextField(
                  onChanged: (v) => setState(() => _query = v),
                  decoration: const InputDecoration(hintText: 'Search name / CNIC / month...', prefixIcon: Icon(Icons.search), border: OutlineInputBorder(), isDense: true),
                ),
                const SizedBox(height: 12),
                if (filtered.isEmpty)
                  const EmptyHint('No rent invoices found.')
                else
                  ...filtered.map(_invoiceTile),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _invoiceTile(RentInvoice inv) {
    final w = _workers[inv.workerId];
    final canCollect = inv.balance > 0 && !['paid', 'cancelled'].contains(inv.status);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(w?.name ?? 'Worker #${inv.workerId}', style: const TextStyle(fontWeight: FontWeight.bold))),
              StatusPill(inv.status),
            ],
          ),
          const SizedBox(height: 2),
          Text('${w?.cnic ?? 'CNIC N/A'} · ${monthLabel(inv.billingMonth)}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Row(
            children: [
              _kv('Due', money(inv.balance), AppColors.error),
              const SizedBox(width: 16),
              _kv('Paid', money(inv.paidAmount), AppColors.success),
              const Spacer(),
              if (canCollect)
                FilledButton(
                  onPressed: () => _collect(inv),
                  style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6), minimumSize: Size.zero),
                  child: const Text('Collect'),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _kv(String k, String v, Color c) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(k, style: const TextStyle(fontSize: 10, color: AppColors.textLight)),
          Text(v, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: c)),
        ],
      );
}

// ── Collect payment sheet ──────────────────────────────────────────────────────

class _PaymentData {
  _PaymentData(this.amount, this.method, this.receiptNo, this.proof);
  final String amount;
  final String method;
  final String? receiptNo;
  final File? proof;
}

class _CollectSheet extends StatefulWidget {
  const _CollectSheet({required this.due});
  final num due;

  @override
  State<_CollectSheet> createState() => _CollectSheetState();
}

class _CollectSheetState extends State<_CollectSheet> {
  late final TextEditingController _amount = TextEditingController(text: widget.due.round().toString());
  final _receipt = TextEditingController();
  String _method = 'cash';
  File? _proof;

  @override
  void dispose() {
    _amount.dispose();
    _receipt.dispose();
    super.dispose();
  }

  Future<void> _pickProof() async {
    final res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['jpg', 'jpeg', 'png']);
    final path = res?.files.single.path;
    if (path != null) setState(() => _proof = File(path));
  }

  void _submit() {
    final amt = double.tryParse(_amount.text.trim()) ?? 0;
    if (amt <= 0 || amt > widget.due) {
      showToast(context, 'Amount Rs.1 se ${money(widget.due)} ke darmiyan ho.', error: true);
      return;
    }
    if (_method != 'cash' && _proof == null) {
      showToast(context, 'Non-cash payment ke liye proof image zaroori hai.', error: true);
      return;
    }
    Navigator.pop(context, _PaymentData(_amount.text.trim(), _method, _receipt.text.trim().isEmpty ? null : _receipt.text.trim(), _proof));
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Collect Rent', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            Text('Balance: ${money(widget.due)}', style: const TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            TextField(controller: _amount, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Payment Amount', border: OutlineInputBorder(), prefixText: 'Rs. ')),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _method,
              decoration: const InputDecoration(labelText: 'Payment Method', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'cash', child: Text('Cash')),
                DropdownMenuItem(value: 'bank_transfer', child: Text('Bank Transfer')),
                DropdownMenuItem(value: 'online', child: Text('Online')),
                DropdownMenuItem(value: 'cheque', child: Text('Cheque')),
                DropdownMenuItem(value: 'easypaisa', child: Text('Easypaisa')),
                DropdownMenuItem(value: 'jazzcash', child: Text('JazzCash')),
              ],
              onChanged: (v) => setState(() {
                _method = v ?? 'cash';
                _proof = null;
              }),
            ),
            const SizedBox(height: 12),
            TextField(controller: _receipt, decoration: const InputDecoration(labelText: 'Receipt No (optional)', border: OutlineInputBorder())),
            if (_method != 'cash') ...[
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _pickProof,
                icon: const Icon(Icons.attach_file),
                label: Text(_proof == null ? 'Attach Payment Proof' : 'Proof selected ✓'),
              ),
            ],
            const SizedBox(height: 16),
            FilledButton(onPressed: _submit, child: const Text('Record Payment')),
          ],
        ),
      ),
    );
  }
}
