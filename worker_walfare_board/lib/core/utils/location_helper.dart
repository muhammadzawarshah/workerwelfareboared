import 'package:geolocator/geolocator.dart';

/// Wraps geolocator permission handling + position fetching with friendly errors.
class LocationHelper {
  const LocationHelper._();

  /// Ensures services + permission, then returns the current high-accuracy fix.
  static Future<Position> current() async {
    final enabled = await Geolocator.isLocationServiceEnabled();
    if (!enabled) {
      throw Exception('Location service band hai. Please GPS on karein.');
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied) {
      throw Exception('Location permission deny ho gayi.');
    }
    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permission permanently deny hai. Settings se allow karein.');
    }

    return Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, timeLimit: Duration(seconds: 15)),
    );
  }

  /// Live position stream for duty tracking.
  static Stream<Position> watch() {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 5),
    );
  }

  /// Haversine distance in meters (mirrors backend `distanceMeters`).
  static double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2);
  }
}
