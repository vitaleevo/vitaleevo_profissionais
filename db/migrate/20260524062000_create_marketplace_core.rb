class CreateMarketplaceCore < ActiveRecord::Migration[8.1]
  def change
    create_table :service_categories do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.integer :base_price_cents, null: false, default: 0
      t.integer :average_duration_minutes, null: false, default: 60
      t.boolean :urgent_available, null: false, default: true

      t.timestamps
    end

    add_index :service_categories, :slug, unique: true

    create_table :clients do |t|
      t.string :name, null: false
      t.string :phone, null: false
      t.string :email
      t.string :company_name
      t.string :address
      t.string :neighborhood
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6

      t.timestamps
    end

    add_index :clients, :phone
    add_index :clients, :email

    create_table :professionals do |t|
      t.string :name, null: false
      t.string :phone, null: false
      t.string :email
      t.string :specialty, null: false
      t.text :bio
      t.string :location, null: false
      t.string :neighborhood
      t.string :status, null: false, default: "offline"
      t.string :documents_status, null: false, default: "pending"
      t.integer :experience_years, null: false, default: 0
      t.integer :hourly_rate_cents, null: false, default: 0
      t.decimal :rating, precision: 3, scale: 2, null: false, default: 0
      t.decimal :quality_rating, precision: 3, scale: 2, null: false, default: 0
      t.decimal :punctuality_rating, precision: 3, scale: 2, null: false, default: 0
      t.decimal :communication_rating, precision: 3, scale: 2, null: false, default: 0
      t.integer :completed_jobs, null: false, default: 0
      t.integer :response_minutes, null: false, default: 30
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6

      t.timestamps
    end

    add_index :professionals, :status
    add_index :professionals, :documents_status

    create_table :professional_services do |t|
      t.references :professional, null: false, foreign_key: true
      t.references :service_category, null: false, foreign_key: true

      t.timestamps
    end

    add_index :professional_services, [ :professional_id, :service_category_id ], unique: true

    create_table :service_requests do |t|
      t.string :code, null: false
      t.references :client, null: false, foreign_key: true
      t.references :service_category, null: false, foreign_key: true
      t.references :professional, foreign_key: true
      t.string :title, null: false
      t.text :description, null: false
      t.string :location, null: false
      t.string :neighborhood
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.string :urgency, null: false, default: "normal"
      t.string :status, null: false, default: "pending"
      t.integer :budget_cents, null: false, default: 0
      t.datetime :scheduled_at
      t.datetime :accepted_at
      t.datetime :started_at
      t.datetime :completed_at
      t.text :operator_notes

      t.timestamps
    end

    add_index :service_requests, :code, unique: true
    add_index :service_requests, :status
    add_index :service_requests, :urgency

    create_table :payments do |t|
      t.references :service_request, null: false, foreign_key: true
      t.integer :amount_cents, null: false, default: 0
      t.integer :commission_cents, null: false, default: 0
      t.integer :professional_payout_cents, null: false, default: 0
      t.string :method, null: false, default: "multicaixa_express"
      t.string :status, null: false, default: "pending"
      t.datetime :paid_at

      t.timestamps
    end

    add_index :payments, :status

    create_table :reviews do |t|
      t.references :service_request, null: false, foreign_key: true
      t.references :professional, null: false, foreign_key: true
      t.references :client, null: false, foreign_key: true
      t.integer :quality, null: false, default: 5
      t.integer :punctuality, null: false, default: 5
      t.integer :communication, null: false, default: 5
      t.text :comment

      t.timestamps
    end

    create_table :notifications do |t|
      t.string :recipient_name, null: false
      t.string :channel, null: false, default: "email"
      t.string :event, null: false
      t.string :title, null: false
      t.text :body
      t.datetime :read_at

      t.timestamps
    end

    add_index :notifications, :event
    add_index :notifications, :channel
  end
end
