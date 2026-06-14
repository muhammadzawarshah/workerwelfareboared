# Flutter wrapper — engine + embedding (kept by the Flutter Gradle plugin, listed here for clarity).
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.embedding.** { *; }
-dontwarn io.flutter.embedding.**

# Plugins that use reflection / platform channels.
-keep class com.baseflow.geolocator.** { *; }
-keep class io.flutter.plugins.imagepicker.** { *; }

# Keep annotations and generic signatures (needed by some plugins / JSON handling).
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod
