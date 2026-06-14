import 'package:flutter/material.dart';

import '../../../core/utils/format.dart';
import '../../../core/utils/json_parse.dart';
import '../../../data/services/api_repository.dart';
import '../common/resource_list_screen.dart';

/// Utility bills list. Read-only mirror of the website's Utility Bills screen.
class UtilitiesScreen extends StatelessWidget {
  const UtilitiesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ResourceListScreen(
      title: 'Utility Bills',
      subtitle: 'Electricity, gas, water & more',
      fetch: ApiRepository.instance.utilityBills,
      leading: Icons.bolt_outlined,
      titleOf: (r) => '${statusLabel(asStr(r['bill_type'], asStr(r['utility_type'], 'Utility')))} · ${asStr(r['consumer_number'], 'Bill ${asStr(r['id'])}')}',
      subtitleOf: (r) => '${monthLabel(r['billing_month'])} · ${money(r['total_amount'] ?? r['amount'])}',
      statusOf: (r) => asStrN(r['status']),
    );
  }
}
