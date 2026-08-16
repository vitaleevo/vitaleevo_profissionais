class CreateServiceRequestAttachments < ActiveRecord::Migration[8.1]
  def change
    create_table :service_request_attachments do |t|
      t.references :service_request, null: false, foreign_key: true
      t.string :original_filename, null: false
      t.string :content_type, null: false
      t.integer :byte_size, null: false

      t.timestamps
    end

    add_index :service_request_attachments, :content_type
  end
end
