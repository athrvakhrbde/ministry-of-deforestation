"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  incidentCreateSchema,
  type IncidentCreateInput,
  type IncidentCreateOutput,
} from "@/lib/schemas";
import {
  INDIAN_STATES,
  REASON_CATEGORIES,
  CLEARANCE_OPTIONS,
} from "@/lib/constants";
import Link from "next/link";

export default function SubmitForm() {
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncidentCreateInput>({
    resolver: zodResolver(incidentCreateSchema),
    defaultValues: {
      species: [],
      media_urls: [],
    },
  });

  const reasonCategory = watch("reason_category");
  const clearanceStatus = watch("clearance_status");

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setValue("lat", pos.coords.latitude);
      setValue("lng", pos.coords.longitude);
    });
  };

  const onSubmit = async (data: IncidentCreateOutput) => {
    setSubmitting(true);
    try {
      let media_urls: string[] = [];
      if (files && files.length > 0) {
        const fd = new FormData();
        Array.from(files).forEach((f) => fd.append("files", f));
        const uploadRes = await fetch("/api/incidents/upload", {
          method: "POST",
          body: fd,
        });
        const uploadData = await uploadRes.json();
        media_urls = uploadData.urls ?? [];
      }

      const speciesArr = data.species
        ? typeof data.species === "string"
          ? (data.species as unknown as string).split(",").map((s) => s.trim()).filter(Boolean)
          : data.species
        : [];

      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          status: "ongoing",
          species: speciesArr.length ? speciesArr : null,
          media_urls: media_urls.length ? media_urls : null,
          source_url: data.source_url || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err.error ?? "Submit failed"));
      }

      setSuccess(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="stamp-filed inline-block border-4 border-red-stamp text-red-stamp font-stat text-4xl px-8 py-4 rotate-[-5deg]">
          REPORT FILED
        </div>
        <p className="font-data text-sm text-muted mt-6">
          Your submission will be reviewed before appearing on the map.
        </p>
        <Link href="/" className="font-data text-xs text-paper mt-4 inline-block hover:underline">
          ← RETURN TO MAP
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
      <div>
        <label htmlFor="location_name" className="gov-label">
          Name of area / locality
        </label>
        <input id="location_name" {...register("location_name")} className="gov-input" />
        {errors.location_name && (
          <p className="text-red-stamp text-xs mt-1">{errors.location_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label htmlFor="state" className="gov-label">State</label>
          <select id="state" {...register("state")} className="gov-input">
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="district" className="gov-label">District</label>
          <input {...register("district")} className="gov-input" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="gov-label">Latitude</label>
          <input type="number" step="any" {...register("lat", { valueAsNumber: true })} className="gov-input" />
        </div>
        <div>
          <label className="gov-label">Longitude</label>
          <input type="number" step="any" {...register("lng", { valueAsNumber: true })} className="gov-input" />
        </div>
      </div>
      <button
        type="button"
        onClick={useMyLocation}
        className="gov-btn w-full sm:w-auto"
      >
        USE MY LOCATION
      </button>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-1">
          Estimated tree count
        </label>
        <input type="number" {...register("tree_count", { valueAsNumber: true })} className="gov-input" />
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-1">Species</label>
        <input
          placeholder="Peepal, Neem, Banyan"
          className="gov-input"
          onChange={(e) =>
            setValue(
              "species",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
        />
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-2">
          Reason category
        </label>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
          {REASON_CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className={`flex items-center gap-2 border p-3 sm:p-3 cursor-pointer font-data text-xs min-h-touch sm:min-h-0 ${
                reasonCategory === cat.value
                  ? "border-paper bg-paper/5"
                  : "border-muted/30"
              }`}
            >
              <input
                type="radio"
                value={cat.value}
                {...register("reason_category")}
                className="sr-only"
              />
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-1">
          Describe the project or incident
        </label>
        <textarea {...register("reason_detail")} rows={4} className="gov-input resize-none" />
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-1">Project name</label>
        <input {...register("project_name")} className="gov-input" />
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-1">
          Authority responsible
        </label>
        <input
          {...register("authority")}
          placeholder="NHAI, BBMP, Municipal Corporation..."
          className="gov-input"
        />
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-1">Ministry</label>
        <input {...register("ministry")} className="gov-input" />
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-2">
          Clearance status
        </label>
        <div className="flex flex-col xs:flex-row flex-wrap gap-2 sm:gap-3">
          {CLEARANCE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`border-2 px-4 py-2.5 font-stat text-sm cursor-pointer text-center min-h-touch flex items-center justify-center ${
                clearanceStatus === opt.value ? opt.stampClass : "border-muted/30 text-muted"
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                {...register("clearance_status")}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-1">
          NGT case number (optional)
        </label>
        <input {...register("ngt_case")} className="gov-input" />
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-1">Source URL</label>
        <input type="url" {...register("source_url")} className="gov-input" />
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-1">
          Source type
        </label>
        <select {...register("source_type")} className="gov-input">
          <option value="crowdsourced">Crowdsourced</option>
          <option value="news">News</option>
          <option value="rti">RTI</option>
          <option value="scraped">Scraped</option>
        </select>
      </div>

      <div>
        <label className="font-data text-[10px] uppercase text-muted block mb-1">
          Upload photos / documents
        </label>
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => setFiles(e.target.files)}
          className="font-data text-xs text-muted w-full"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="gov-btn-primary flex items-center justify-center gap-2"
      >
        {submitting ? "FILING..." : "▣ SUBMIT REPORT"}
      </button>
    </form>
  );
}
