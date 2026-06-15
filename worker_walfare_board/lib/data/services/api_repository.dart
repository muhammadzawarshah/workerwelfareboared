import 'dart:io';

import '../../core/network/api_client.dart';

/// Single access point for every backend resource + workflow action the mobile
/// app needs. Method names mirror the website's API calls so the dashboards map
/// 1:1 to the web frontend behaviour.
class ApiRepository {
  ApiRepository._();
  static final ApiRepository instance = ApiRepository._();

  final _api = ApiClient.instance;

  // ── Generic list fetchers ────────────────────────────────────────────────────
  Future<List<Map<String, dynamic>>> list(String path, {Map<String, dynamic>? query}) =>
      _api.getRows(path, query: {'limit': 100, ...?query});

  Future<List<Map<String, dynamic>>> workers() => list('/workers');
  Future<List<Map<String, dynamic>>> applications() => list('/worker-applications');
  Future<List<Map<String, dynamic>>> flats() => list('/residential-units');
  Future<List<Map<String, dynamic>>> flatAssignments() => list('/flat-assignments');
  Future<List<Map<String, dynamic>>> industries() => list('/industries');
  Future<List<Map<String, dynamic>>> districts() => list('/districts');
  Future<List<Map<String, dynamic>>> colonies() => list('/colonies');
  Future<List<Map<String, dynamic>>> zones() => list('/zones');
  Future<List<Map<String, dynamic>>> documents() => list('/documents');
  Future<List<Map<String, dynamic>>> documentTypes() => list('/document-types');
  Future<List<Map<String, dynamic>>> rentInvoices() => list('/rent-invoices');
  Future<List<Map<String, dynamic>>> rentRates() => list('/rent-rates');
  Future<List<Map<String, dynamic>>> lateFeeRules() => list('/late-fee-rules');
  Future<List<Map<String, dynamic>>> rentPayments() => list('/rent-payments');
  Future<List<Map<String, dynamic>>> complaints() => list('/complaints');
  Future<List<Map<String, dynamic>>> utilityBills() => list('/utility-bills');
  Future<List<Map<String, dynamic>>> utilityPayments() => list('/utility-payments');
  Future<List<Map<String, dynamic>>> assets() => list('/assets');
  Future<List<Map<String, dynamic>>> caretakerTasks() => list('/caretaker/tasks');
  Future<List<Map<String, dynamic>>> caretakerAttendance() => list('/caretaker/attendance');
  Future<List<Map<String, dynamic>>> caretakerGps({int? userId}) =>
      userId != null ? list('/caretaker/gps/$userId') : list('/caretaker/gps');
  Future<List<Map<String, dynamic>>> taskProofs() => list('/task-proofs');
  Future<List<Map<String, dynamic>>> evictionCases() => list('/eviction-cases');
  Future<List<Map<String, dynamic>>> evictionHearings() => list('/eviction-hearings');
  Future<List<Map<String, dynamic>>> users() => list('/users');
  Future<List<Map<String, dynamic>>> notifications() => list('/notifications');

  Future<Map<String, dynamic>> dashboard(String name) async {
    final data = await _api.get('/dashboard/$name');
    return data is Map<String, dynamic> ? data : <String, dynamic>{};
  }

  // ── Documents ────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> uploadDocument({
    required File file,
    required int documentTypeId,
    required String ownerType,
    int? ownerId,
    int? applicationId,
    String? visibility,
    String? remarks,
  }) async {
    final res = await _api.upload('/documents/upload', file: file, fields: {
      'document_type_id': '$documentTypeId',
      'owner_type': ownerType,
      if (ownerId != null) 'owner_id': '$ownerId',
      if (applicationId != null) 'application_id': '$applicationId',
      if (visibility != null) 'visibility': visibility,
      if (remarks != null) 'remarks': remarks,
    });
    return Map<String, dynamic>.from(res as Map);
  }

  Future<dynamic> verifyDocument(int id, {String? remarks}) =>
      _api.post('/documents/$id/verify', body: {'remarks': remarks ?? 'Approved from mobile'});

  Future<dynamic> rejectDocument(int id, {String? reason}) =>
      _api.post('/documents/$id/reject', body: {'rejection_reason': reason ?? 'Rejected from mobile'});

  Future<dynamic> sendDocumentToDepartment(int id) =>
      _api.put('/documents/$id', body: {'status': 'processing', 'remarks': 'Sent to concerned department for verification.'});

  Future<List<int>> downloadDocument(int id) => _api.downloadBytes('/documents/$id/download');

  // ── Worker applications ──────────────────────────────────────────────────────
  Future<Map<String, dynamic>> intake({
    required Map<String, dynamic> worker,
    required Map<String, dynamic> application,
  }) async {
    final res = await _api.post('/worker-applications/intake', body: {
      'worker': worker,
      'application': application,
    });
    return Map<String, dynamic>.from(res as Map);
  }

  Future<dynamic> verifyApplication(int id, {required bool passed, String? remarks, num? recommendedRent}) =>
      _api.post('/worker-applications/$id/verify', body: {
        'verification_status': passed ? 'passed' : 'failed',
        if (remarks != null) 'verification_remarks': remarks,
        if (recommendedRent != null) 'recommended_rent_amount': recommendedRent.toString(),
      });

  Future<dynamic> rejectVerification(int id, {String? remarks}) =>
      _api.post('/worker-applications/$id/reject-verification', body: {
        'verification_status': 'failed',
        'verification_remarks': remarks ?? 'One or more required documents were rejected.',
      });

  Future<dynamic> approveApplication(int id, {String? remarks}) =>
      _api.post('/worker-applications/$id/approve', body: {
        'committee_decision': 'approved',
        'committee_remarks': remarks ?? 'Approved by committee',
      });

  Future<dynamic> rejectApplication(int id, {String? reason}) =>
      _api.post('/worker-applications/$id/reject', body: {'rejected_reason': reason ?? 'Rejected by committee'});

  // ── Allotment workflow handoffs ──────────────────────────────────────────────
  // Caretaker forwards a submitted application up to AD (Colonies).
  Future<dynamic> forwardApplicationToAdColony(int id, {String? remarks}) =>
      _api.post('/worker-applications/$id/forward-to-ad-colony',
          body: {if (remarks != null) 'remarks': remarks});

  // AD (Colonies) sets the recommended rent and sends it to the committee.
  Future<dynamic> forwardApplicationToCommittee(int id, {required num recommendedRent, String? remarks}) =>
      _api.post('/worker-applications/$id/forward-to-committee', body: {
        'recommended_rent_amount': recommendedRent.toString(),
        if (remarks != null) 'verification_remarks': remarks,
      });

  // AD (Colonies) issues the allotment notification (after approval).
  Future<dynamic> issueAllotmentNotification(int id, {String? remarks}) =>
      _api.post('/worker-applications/$id/issue-notification',
          body: {if (remarks != null) 'remarks': remarks});

  // ── Flat assignment (done by AD Colonies after committee approval) ───────────
  Future<dynamic> assignFlat({
    required int workerId,
    required int flatId,
    required int applicationId,
    required String rentAmount,
    String? startDate,
    String? remarks,
  }) =>
      _api.post('/flat-assignments', body: {
        'worker_id': workerId,
        'flat_id': flatId,
        'application_id': applicationId,
        'start_date': startDate ?? DateTime.now().toIso8601String().substring(0, 10),
        'rent_amount': rentAmount,
        'remarks': remarks ?? 'Flat assigned by AD (Colonies)',
      });

  Future<dynamic> createNotification(Map<String, dynamic> body) => _api.post('/notifications', body: body);

  // ── Rent ─────────────────────────────────────────────────────────────────────
  Future<dynamic> generateRentInvoices({required String billingMonth, required String dueDate}) =>
      _api.post('/rent-invoices/generate', body: {'billing_month': billingMonth, 'due_date': dueDate});

  Future<Map<String, dynamic>> payRentInvoice(
    int id, {
    required String amount,
    required String paymentDate,
    required String paymentMethod,
    String? receiptNo,
    String? remarks,
  }) async {
    final res = await _api.post('/rent-invoices/$id/pay', body: {
      'amount': amount,
      'payment_date': paymentDate,
      'payment_method': paymentMethod,
      if (receiptNo != null) 'receipt_no': receiptNo,
      if (remarks != null) 'remarks': remarks,
    });
    return Map<String, dynamic>.from(res as Map);
  }

  Future<dynamic> applyLateFee(int id) => _api.post('/rent-invoices/$id/apply-late-fee');

  // Accountant: caretaker-wise pending cash, plus worker / colony breakdowns.
  Future<List<Map<String, dynamic>>> rentCollectionSummary({bool remitted = false}) =>
      list('/rent-collections/summary', query: remitted ? {'remitted': 'true'} : null);
  Future<List<Map<String, dynamic>>> rentCollectionByWorker({String? billingMonth}) =>
      list('/rent-collections/by-worker', query: billingMonth != null ? {'billing_month': billingMonth} : null);
  Future<List<Map<String, dynamic>>> rentCollectionByColony({String? billingMonth}) =>
      list('/rent-collections/by-colony', query: billingMonth != null ? {'billing_month': billingMonth} : null);
  // Caretaker: rent collected but not yet handed to the accountant.
  Future<List<Map<String, dynamic>>> myPendingCollection() => list('/rent-collections/my-pending');
  Future<List<Map<String, dynamic>>> rentRemittances() => list('/rent-remittances');
  // Accountant generates a monthly handover voucher for a caretaker.
  Future<dynamic> generateRemittanceVoucher({required int caretakerUserId, required String billingMonth, String? remarks}) =>
      _api.post('/rent-remittances', body: {
        'caretaker_user_id': caretakerUserId,
        'billing_month': billingMonth,
        if (remarks != null) 'remarks': remarks,
      });
  // Caretaker pays a voucher: uploads a handover screenshot and marks it paid.
  Future<dynamic> payRemittanceVoucher(int id, {required int imageDocumentId, String? remarks}) =>
      _api.post('/rent-remittances/$id/pay', body: {
        'image_document_id': imageDocumentId,
        if (remarks != null) 'remarks': remarks,
      });

  // ── Complaints ───────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createComplaint(Map<String, dynamic> body) async {
    final res = await _api.post('/complaints', body: body);
    return Map<String, dynamic>.from(res as Map);
  }

  Future<dynamic> assignComplaint(int id, Map<String, dynamic> body) =>
      _api.post('/complaints/$id/assign', body: body);

  Future<dynamic> resolveComplaint(int id) => _api.post('/complaints/$id/resolve');
  // Caretaker verifies on-site: uploads an image/video document + current GPS;
  // backend checks the GPS is within the complaint's radius before resolving.
  Future<dynamic> resolveComplaintWithProof(
    int id, {
    required int imageDocumentId,
    double? latitude,
    double? longitude,
    String? remarks,
  }) =>
      _api.post('/complaints/$id/resolve', body: {
        'image_document_id': imageDocumentId,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (remarks != null) 'resolution_remarks': remarks,
      });
  Future<dynamic> closeComplaint(int id) => _api.post('/complaints/$id/close');

  // ── Caretaker ────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> attendanceLogin(Map<String, dynamic> body) async {
    final res = await _api.post('/caretaker/attendance/login', body: body);
    return Map<String, dynamic>.from(res as Map);
  }

  Future<dynamic> attendanceLogout(Map<String, dynamic> body) =>
      _api.post('/caretaker/attendance/logout', body: body);

  Future<dynamic> gpsPing(Map<String, dynamic> body) => _api.post('/caretaker/gps', body: body);

  Future<dynamic> startTask(int id) => _api.post('/caretaker/tasks/$id/start');

  Future<Map<String, dynamic>> createTask(Map<String, dynamic> body) async {
    final res = await _api.post('/caretaker/tasks', body: body);
    return Map<String, dynamic>.from(res as Map);
  }

  Future<dynamic> uploadTaskProof(int taskId, Map<String, dynamic> body) =>
      _api.post('/caretaker-tasks/$taskId/proofs', body: body);

  Future<dynamic> setAssetStatus(int assetId, String status) =>
      _api.post('/assets/$assetId/status', body: {'status': status});

  // ── Assets / colonies / flats setup ──────────────────────────────────────────
  Future<Map<String, dynamic>> createColony(Map<String, dynamic> body) async {
    final res = await _api.post('/colonies', body: body);
    return Map<String, dynamic>.from(res as Map);
  }

  // Caretaker ↔ colony assignment (rent/flat scope is per assigned colony).
  Future<List<Map<String, dynamic>>> caretakerColonies() => list('/colonies/caretaker-assignments');
  Future<dynamic> assignCaretakerColony({required int userId, required int colonyId}) =>
      _api.post('/colonies/caretaker-assignments', body: {'user_id': userId, 'colony_id': colonyId});

  Future<Map<String, dynamic>> createFlat(Map<String, dynamic> body) async {
    final res = await _api.post('/residential-units', body: body);
    return Map<String, dynamic>.from(res as Map);
  }

  Future<Map<String, dynamic>> createAsset(Map<String, dynamic> body) async {
    final res = await _api.post('/assets', body: body);
    return Map<String, dynamic>.from(res as Map);
  }

  // ── Evictions ────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createEvictionCase(Map<String, dynamic> body) async {
    final res = await _api.post('/eviction-cases', body: body);
    return Map<String, dynamic>.from(res as Map);
  }

  Future<dynamic> updateEvictionCase(int id, Map<String, dynamic> body) =>
      _api.put('/eviction-cases/$id', body: body);

  Future<dynamic> createEvictionHearing(Map<String, dynamic> body) =>
      _api.post('/eviction-hearings', body: body);

  // ── Industries / users ───────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createIndustry(Map<String, dynamic> body) async {
    final res = await _api.post('/industries', body: body);
    return Map<String, dynamic>.from(res as Map);
  }

  Future<Map<String, dynamic>> createUser(Map<String, dynamic> body) async {
    final res = await _api.post('/users', body: body);
    return Map<String, dynamic>.from(res as Map);
  }

  Future<dynamic> updateUser(int id, Map<String, dynamic> body) => _api.put('/users/$id', body: body);
  Future<dynamic> deleteUser(int id) => _api.delete('/users/$id');

  // ── Generic resource CRUD (used by managed list screens) ─────────────────────
  Future<dynamic> createResource(String path, Map<String, dynamic> body) => _api.post(path, body: body);
  Future<dynamic> updateResource(String path, int id, Map<String, dynamic> body) => _api.put('$path/$id', body: body);
  Future<dynamic> deleteResource(String path, int id) => _api.delete('$path/$id');
}
