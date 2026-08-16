class CreateProfessionalDocuments < ActiveRecord::Migration[8.1]
  def change
    create_table :professional_documents do |t|
      t.references :professional, null: false, foreign_key: true
      t.references :reviewed_by, foreign_key: { to_table: :users }
      t.string :kind, null: false
      t.string :status, null: false, default: "pending"
      t.string :original_filename, null: false
      t.string :content_type, null: false
      t.integer :byte_size, null: false
      t.text :review_notes
      t.datetime :reviewed_at

      t.timestamps
    end

    add_index :professional_documents, :kind
    add_index :professional_documents, :status
  end
end
