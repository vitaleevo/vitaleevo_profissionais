class CreateAuditLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :audit_logs do |t|
      t.references :actor,
        null: true,
        foreign_key: { to_table: :users, on_delete: :nullify }
      t.string :action, null: false
      t.references :auditable, polymorphic: true, null: true
      t.jsonb :metadata, null: false, default: {}

      t.timestamps
    end

    add_index :audit_logs, :action
    add_index :audit_logs, :created_at
  end
end
