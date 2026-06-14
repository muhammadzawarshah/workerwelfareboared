import '../../core/utils/json_parse.dart';

/// Authenticated user returned by `/auth/login` and `/users`.
class AppUser {
  AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.profilePhoto,
    this.colonyId,
    this.phoneNumber,
  });

  final int id;
  final String name;
  final String email;
  final String role;
  final String? profilePhoto;
  final int? colonyId;
  final String? phoneNumber;

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: asInt(json['id']),
      name: asStr(json['name']),
      email: asStr(json['email']),
      role: asStr(json['role']),
      profilePhoto: asStrN(json['profile_photo']),
      colonyId: asIntN(json['colony_id']),
      phoneNumber: asStrN(json['phone_number']),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'role': role,
        'profile_photo': profilePhoto,
        'colony_id': colonyId,
        'phone_number': phoneNumber,
      };
}
