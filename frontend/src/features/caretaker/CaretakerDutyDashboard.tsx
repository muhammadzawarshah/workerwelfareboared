"use client";

import { useEffect, useRef, useState } from "react";
import type { CaretakerAttendance, GpsPing, User } from "@/src/types";
import { apiRequest } from "@/src/lib/api";
import { useToast } from "@/src/components/ui/ToastProvider";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { GpsMap } from "@/src/components/ui/GpsMap";
import { LocationPicker, type LatLng } from "@/src/components/ui/LocationPicker";

const ASSET_CATS = [
  { value: "street_light",  label: "Street Light" },
  { value: "transformer",   label: "Transformer" },
  { value: "tube_well",     label: "Tube Well" },
  { value: "generator",     label: "Generator" },
  { value: "water_tank",    label: "Water Tank" },
  { value: "sewerage_pump", label: "Sewerage Pump" },
  { value: "road",          label: "Road / Pathway" },
  { value: "boundary_wall", label: "Boundary Wall" },
  { value: "other",         label: "Other" },
];

export function CaretakerDutyDashboard({
  token,
  user,
  assignedColonyName,
  attendance,
  gps,
  onRefresh,
}: {
  token: string;
  user: User;
  assignedColonyName?: string;
  attendance: CaretakerAttendance[];
  gps: GpsPing[];
  onRefresh?: () => void;
}) {
  const [attendanceId, setAttendanceId] = useState<number | null>(null);
  const setMessage = useToast();
  const [, setTracking] = useState(false);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const watchRef = useRef<number | null>(null);
  const activeAttendance = attendance.find((item) => item.status === "active" && !item.logout_time);
  const isDutyActive = !!(attendanceId || activeAttendance);

  // ── Complaint filing state ──────────────────────────────────────────────────
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintSaving, setComplaintSaving] = useState(false);
  const [cType, setCType] = useState<"asset" | "general">("asset");
  const [cAssetType, setCAssetType] = useState("street_light");
  const [cDesc, setCDesc] = useState("");
  const [cLoc, setCLoc] = useState<LatLng | null>(null);

  // Restore any in-progress attendance session from browser storage after mount.
  /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from browser storage */
  useEffect(() => {
    const stored = localStorage.getItem("wwb_attendance_id");
    if (stored) setAttendanceId(Number(stored));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    return () => {
      if (watchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  function getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Browser location is not available."));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 15000,
      });
    });
  }

  async function sendLocation(path = "/caretaker/gps", extra: Record<string, unknown> = {}) {
    setMessage("Getting current location...");
    const position = await getPosition();
    setCurrentPos([position.coords.latitude, position.coords.longitude]);
    const payload = {
      user_id: user.id,
      attendance_id: attendanceId || activeAttendance?.id,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      ...extra,
    };
    const result = await apiRequest<unknown>(path, token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setMessage("Location sent successfully.");
    return { result, payload };
  }

  function sendGpsPayload(position: GeolocationPosition) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setCurrentPos([lat, lng]);
    const payload = {
      user_id: user.id,
      attendance_id: attendanceId || activeAttendance?.id,
      latitude: lat,
      longitude: lng,
      accuracy: position.coords.accuracy,
    };
    apiRequest("/caretaker/gps", token, { method: "POST", body: JSON.stringify(payload) }).catch(() => {});
  }

  function startLiveTracking() {
    if (!navigator.geolocation) {
      setMessage("Browser location is not available.");
      return;
    }
    if (watchRef.current !== null) return;
    watchRef.current = navigator.geolocation.watchPosition(sendGpsPayload, (error) => setMessage(error.message), {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 10000,
    });
    setTracking(true);
    setMessage("Live location tracking started.");
  }

  function stopLiveTracking() {
    if (watchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    setTracking(false);
    setMessage("Live location tracking stopped.");
  }

  async function startDuty() {
    try {
      const { result } = await sendLocation("/caretaker/attendance/login");
      const created = result as CaretakerAttendance;
      if (created.id) {
        localStorage.setItem("wwb_attendance_id", String(created.id));
        setAttendanceId(created.id);
      }
      setMessage("Duty started with current GPS location.");
      startLiveTracking();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start duty.");
    }
  }

  async function endDuty() {
    try {
      const id = attendanceId || activeAttendance?.id;
      if (!id) {
        setMessage("No active attendance found.");
        return;
      }
      await sendLocation("/caretaker/attendance/logout", { attendance_id: id });
      stopLiveTracking();
      localStorage.removeItem("wwb_attendance_id");
      setAttendanceId(null);
      setMessage("Duty completed with logout location.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to end duty.");
    }
  }

  async function submitComplaint(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!cDesc.trim()) { setMessage("Complaint description required."); return; }
    setComplaintSaving(true);
    try {
      const assetLabel = ASSET_CATS.find((c) => c.value === cAssetType)?.label || cAssetType;
      const descText = cType === "asset"
        ? `[Asset: ${assetLabel}] ${cDesc.trim()}`
        : cDesc.trim();
      await apiRequest("/complaints", token, {
        method: "POST",
        body: JSON.stringify({
          complaint_desc: descText,
          colony_id: user.colony_id || undefined,
          complaint_type: cType,
          latitude: cLoc?.lat ?? undefined,
          longitude: cLoc?.lng ?? undefined,
        }),
      });
      setCDesc("");
      setCLoc(null);
      setCType("asset");
      setCAssetType("street_light");
      setShowComplaintForm(false);
      setMessage("Complaint darj ho gayi — admin review karega.");
      onRefresh?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Complaint submit failed.");
    } finally {
      setComplaintSaving(false);
    }
  }

  return (
    <div className="screen-stack">
      <section className="metric-grid">
        <MetricCard title="Active Duty" value={isDutyActive ? "Active" : "Off Duty"} hint="Attendance session" tone="green" />
        <MetricCard title="GPS Pings" value={gps.length} hint={currentPos ? `${currentPos[0].toFixed(5)}, ${currentPos[1].toFixed(5)}` : "Duty start hone ka intezaar"} tone="purple" />
      </section>

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Caretaker Duty Control</h2>
            <p>
              {assignedColonyName
                ? <>Assigned colony: <strong>{assignedColonyName}</strong> — you will only see data for this colony.</>
                : "Start duty once; live location begins automatically and remains linked with attendance."}
            </p>
          </div>
          {assignedColonyName ? <span className="soft-tag">{assignedColonyName}</span> : null}
        </div>
        {!isDutyActive && (
          <div className="duty-lock-banner">
            Duty shuru nahi hui — koi bhi action karne se pehle <strong>Start Duty</strong> dabayein.
          </div>
        )}
        <div className="toolbar-row">
          <button className="primary-button" onClick={startDuty} disabled={isDutyActive}>
            {isDutyActive ? "Duty Active" : "Start Duty"}
          </button>
          <button className="ghost-button" onClick={endDuty} disabled={!isDutyActive}>
            End Duty
          </button>
        </div>
      </section>

      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Live Location Map</h2>
            <p>
              {currentPos
                ? `Is waqt: ${currentPos[0].toFixed(6)}, ${currentPos[1].toFixed(6)} — ${gps.length} GPS pings recorded`
                : "Duty start karein — aapka GPS trail aur current location yahan dikhega."}
            </p>
          </div>
        </div>
        <GpsMap pings={gps} currentPos={currentPos} height={420} />
      </section>

      {/* ── File Complaint ────────────────────────────────────────────────────── */}
      <section className="data-card">
        <div className="card-title">
          <div>
            <h2>Complaint File Karein</h2>
            <p>Koi asset kharab ho ya general masla — admin ko complaint forward ho jaegi.</p>
          </div>
          <button
            type="button"
            className={showComplaintForm ? "ghost-button" : "primary-button"}
            onClick={() => setShowComplaintForm((v) => !v)}
          >
            {showComplaintForm ? "Cancel" : "New Complaint"}
          </button>
        </div>

        {showComplaintForm && (
          <form className="complaint-inline-form" onSubmit={submitComplaint}>
            <div className="form-grid">
              <label>
                <span>Complaint Type</span>
                <select value={cType} onChange={(e) => setCType(e.target.value as "asset" | "general")}>
                  <option value="asset">Asset Problem (street light, pump, etc.)</option>
                  <option value="general">General Complaint</option>
                </select>
              </label>

              {cType === "asset" && (
                <label>
                  <span>Asset Type</span>
                  <select value={cAssetType} onChange={(e) => setCAssetType(e.target.value)}>
                    {ASSET_CATS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                <span>Description <em className="req-mark">*</em></span>
                <textarea
                  required
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder={cType === "asset" ? "Kya masla hai? e.g. Street light jalti nahi" : "Complaint details..."}
                  rows={3}
                />
              </label>
            </div>

            {cType === "asset" && (
              <div className="form-map-section">
                <p className="form-map-label">
                  Asset Location (Map)
                  {cLoc
                    ? <span className="gps-coords-hint"> — {cLoc.lat.toFixed(6)}, {cLoc.lng.toFixed(6)}</span>
                    : <span className="muted-text"> — Map pe us jagah ka pin lagayein jahan asset kharab hai</span>}
                </p>
                <LocationPicker value={cLoc} onChange={setCLoc} hint="Jo asset kharab hai us ki location mark karein." />
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="ghost-button" onClick={() => setShowComplaintForm(false)}>Cancel</button>
              <button className="primary-button" disabled={complaintSaving}>
                {complaintSaving ? "Submitting..." : "Complaint Submit Karein"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
