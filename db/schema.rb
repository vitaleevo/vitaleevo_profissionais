# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_03_154500) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "audit_logs", force: :cascade do |t|
    t.string "action", null: false
    t.bigint "actor_id"
    t.bigint "auditable_id"
    t.string "auditable_type"
    t.datetime "created_at", null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "updated_at", null: false
    t.index ["action"], name: "index_audit_logs_on_action"
    t.index ["actor_id"], name: "index_audit_logs_on_actor_id"
    t.index ["auditable_type", "auditable_id"], name: "index_audit_logs_on_auditable"
    t.index ["created_at"], name: "index_audit_logs_on_created_at"
  end

  create_table "clients", force: :cascade do |t|
    t.string "address"
    t.string "company_name"
    t.datetime "created_at", null: false
    t.string "email"
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.string "municipality"
    t.string "name", null: false
    t.string "neighborhood"
    t.string "phone", null: false
    t.string "province"
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["email"], name: "index_clients_on_email"
    t.index ["phone"], name: "index_clients_on_phone"
    t.index ["user_id"], name: "index_clients_on_user_id", unique: true
  end

  create_table "notifications", force: :cascade do |t|
    t.text "body"
    t.string "channel", default: "email", null: false
    t.datetime "created_at", null: false
    t.string "event", null: false
    t.datetime "read_at"
    t.string "recipient_name", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["channel"], name: "index_notifications_on_channel"
    t.index ["event"], name: "index_notifications_on_event"
  end

  create_table "payments", force: :cascade do |t|
    t.integer "amount_cents", default: 0, null: false
    t.integer "commission_cents", default: 0, null: false
    t.datetime "created_at", null: false
    t.string "method", default: "multicaixa_express", null: false
    t.datetime "paid_at"
    t.integer "professional_payout_cents", default: 0, null: false
    t.bigint "service_request_id", null: false
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.index ["service_request_id"], name: "index_payments_on_service_request_id"
    t.index ["status"], name: "index_payments_on_status"
    t.check_constraint "(commission_cents + professional_payout_cents) = amount_cents", name: "payments_split_matches_amount"
  end

  create_table "professional_documents", force: :cascade do |t|
    t.integer "byte_size", null: false
    t.string "content_type", null: false
    t.datetime "created_at", null: false
    t.string "kind", null: false
    t.string "original_filename", null: false
    t.bigint "professional_id", null: false
    t.text "review_notes"
    t.datetime "reviewed_at"
    t.bigint "reviewed_by_id"
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.index ["kind"], name: "index_professional_documents_on_kind"
    t.index ["professional_id"], name: "index_professional_documents_on_professional_id"
    t.index ["reviewed_by_id"], name: "index_professional_documents_on_reviewed_by_id"
    t.index ["status"], name: "index_professional_documents_on_status"
  end

  create_table "professional_services", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "professional_id", null: false
    t.bigint "service_category_id", null: false
    t.datetime "updated_at", null: false
    t.index ["professional_id", "service_category_id"], name: "idx_on_professional_id_service_category_id_1b252270c0", unique: true
    t.index ["professional_id"], name: "index_professional_services_on_professional_id"
    t.index ["service_category_id"], name: "index_professional_services_on_service_category_id"
  end

  create_table "professionals", force: :cascade do |t|
    t.text "bio"
    t.decimal "communication_rating", precision: 3, scale: 2, default: "0.0", null: false
    t.integer "completed_jobs", default: 0, null: false
    t.datetime "created_at", null: false
    t.string "documents_status", default: "pending", null: false
    t.string "email"
    t.integer "experience_years", default: 0, null: false
    t.integer "hourly_rate_cents", default: 0, null: false
    t.decimal "latitude", precision: 10, scale: 6
    t.string "location", null: false
    t.decimal "longitude", precision: 10, scale: 6
    t.string "municipality"
    t.string "name", null: false
    t.string "neighborhood"
    t.text "operator_notes"
    t.string "phone", null: false
    t.string "province"
    t.decimal "punctuality_rating", precision: 3, scale: 2, default: "0.0", null: false
    t.decimal "quality_rating", precision: 3, scale: 2, default: "0.0", null: false
    t.decimal "rating", precision: 3, scale: 2, default: "0.0", null: false
    t.integer "response_minutes", default: 30, null: false
    t.string "specialty", null: false
    t.string "status", default: "offline", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["documents_status"], name: "index_professionals_on_documents_status"
    t.index ["municipality"], name: "index_professionals_on_municipality"
    t.index ["neighborhood"], name: "index_professionals_on_neighborhood"
    t.index ["province"], name: "index_professionals_on_province"
    t.index ["status"], name: "index_professionals_on_status"
    t.index ["user_id"], name: "index_professionals_on_user_id", unique: true
  end

  create_table "reviews", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.text "comment"
    t.integer "communication", default: 5, null: false
    t.datetime "created_at", null: false
    t.bigint "professional_id", null: false
    t.integer "punctuality", default: 5, null: false
    t.integer "quality", default: 5, null: false
    t.bigint "service_request_id", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_reviews_on_client_id"
    t.index ["professional_id"], name: "index_reviews_on_professional_id"
    t.index ["service_request_id"], name: "index_reviews_on_service_request_id", unique: true
  end

  create_table "service_categories", force: :cascade do |t|
    t.integer "average_duration_minutes", default: 60, null: false
    t.integer "base_price_cents", default: 0, null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.string "slug", null: false
    t.datetime "updated_at", null: false
    t.boolean "urgent_available", default: true, null: false
    t.index ["slug"], name: "index_service_categories_on_slug", unique: true
  end

  create_table "service_request_attachments", force: :cascade do |t|
    t.integer "byte_size", null: false
    t.string "content_type", null: false
    t.datetime "created_at", null: false
    t.string "original_filename", null: false
    t.bigint "service_request_id", null: false
    t.datetime "updated_at", null: false
    t.index ["content_type"], name: "index_service_request_attachments_on_content_type"
    t.index ["service_request_id"], name: "index_service_request_attachments_on_service_request_id"
  end

  create_table "service_requests", force: :cascade do |t|
    t.datetime "accepted_at"
    t.integer "budget_cents", default: 0, null: false
    t.bigint "client_id", null: false
    t.string "code", null: false
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.text "description", null: false
    t.decimal "latitude", precision: 10, scale: 6
    t.string "location", null: false
    t.decimal "longitude", precision: 10, scale: 6
    t.string "municipality"
    t.string "neighborhood"
    t.text "operator_notes"
    t.bigint "professional_id"
    t.string "province"
    t.datetime "scheduled_at"
    t.bigint "service_category_id", null: false
    t.datetime "started_at"
    t.string "status", default: "pending", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.string "urgency", default: "normal", null: false
    t.index ["client_id"], name: "index_service_requests_on_client_id"
    t.index ["code"], name: "index_service_requests_on_code", unique: true
    t.index ["municipality"], name: "index_service_requests_on_municipality"
    t.index ["professional_id"], name: "index_service_requests_on_professional_id"
    t.index ["province"], name: "index_service_requests_on_province"
    t.index ["service_category_id"], name: "index_service_requests_on_service_category_id"
    t.index ["status"], name: "index_service_requests_on_status"
    t.index ["urgency"], name: "index_service_requests_on_urgency"
  end

  create_table "users", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "name", default: "", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "role", default: "client", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_users_on_active"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "audit_logs", "users", column: "actor_id", on_delete: :nullify
  add_foreign_key "clients", "users"
  add_foreign_key "payments", "service_requests"
  add_foreign_key "professional_documents", "professionals"
  add_foreign_key "professional_documents", "users", column: "reviewed_by_id"
  add_foreign_key "professional_services", "professionals"
  add_foreign_key "professional_services", "service_categories"
  add_foreign_key "professionals", "users"
  add_foreign_key "reviews", "clients"
  add_foreign_key "reviews", "professionals"
  add_foreign_key "reviews", "service_requests"
  add_foreign_key "service_request_attachments", "service_requests"
  add_foreign_key "service_requests", "clients"
  add_foreign_key "service_requests", "professionals"
  add_foreign_key "service_requests", "service_categories"
end
