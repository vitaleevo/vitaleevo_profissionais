class AddRolesAndProfilesToUsers < ActiveRecord::Migration[8.1]
  def change
    change_table :users, bulk: true do |t|
      t.string :name, null: false, default: ""
      t.string :role, null: false, default: "client"
      t.boolean :active, null: false, default: true
    end

    add_index :users, :role
    add_index :users, :active

    add_reference :clients, :user, foreign_key: true, index: false
    add_reference :professionals, :user, foreign_key: true, index: false

    add_index :clients, :user_id, unique: true
    add_index :professionals, :user_id, unique: true
  end
end
