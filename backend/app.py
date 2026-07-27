import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import Client, create_client

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5174", "http://127.0.0.1:5174"])

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

ALLOWED_STATUSES = [
        "Applied",
        "Interviewing",
        "Offer",
        "Rejected"
    ]

@app.get("/api/health")
def get_health():
    response = (
        supabase.table("jobs").select("*").limit(1).execute()
    )
    return jsonify({
        "status": "ok",
        "supabase": "connected",
        "rows_returned": len(response.data)
    }), 200


@app.get("/api/jobs")
def get_jobs():
    response = supabase.table("jobs").select("*").order("created_at", desc=True).execute()
    return jsonify(response.data), 200

@app.post("/api/jobs")
def create_job():
    job_data = request.get_json()

    company = job_data.get("company")
    role = job_data.get("role")
    status = job_data.get("status")
    date_applied = job_data.get("date_applied")

    if not company or not role or not status:
        return jsonify({
            "error": "company, role, and status are required"
        }), 400

    if status not in ALLOWED_STATUSES:
        return jsonify({
            "error": "Invalid status"
        }), 400
    
    new_job = {
        "company": company,
        "role": role,
        "status": status,
        "date_applied": date_applied or None
    }

    response = (
        supabase.table("jobs").insert(new_job).execute()
    )

    return jsonify(response.data[0]), 201


@app.patch("/api/jobs/<int:job_id>")
def update_job_status(job_id):
    job_data = request.get_json()
    status = job_data.get("status")

    if not status:
        return jsonify({
            "error": "status is required"
        }), 400
    
    if status not in ALLOWED_STATUSES:
        return jsonify({
            "error": "Invalid Status"
        }), 400
    
    response = supabase.table("jobs").update({"status": status}).eq("id", job_id).execute()

    if not response.data:
        return jsonify({
            "error": "Job not found"
        }), 400
    
    return response.data[0], 200

@app.delete("/api/jobs/<int:job_id>")
def delete_job(job_id):
    response = (
        supabase
        .table("jobs")
        .delete()
        .eq("id", job_id)
        .execute()
    )

    if not response.data:
        return {"error": "Job not found"}, 400
    
    return {"message": "Job deleted successfully"}, 200

if __name__ == "__main__":
    app.run(debug=True)