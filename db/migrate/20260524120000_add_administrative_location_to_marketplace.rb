class AddAdministrativeLocationToMarketplace < ActiveRecord::Migration[8.1]
  def change
    add_column :clients, :province, :string
    add_column :clients, :municipality, :string
    add_column :professionals, :province, :string
    add_column :professionals, :municipality, :string
    add_column :service_requests, :province, :string
    add_column :service_requests, :municipality, :string

    add_index :professionals, :province
    add_index :professionals, :municipality
    add_index :professionals, :neighborhood
    add_index :service_requests, :province
    add_index :service_requests, :municipality
  end
end
