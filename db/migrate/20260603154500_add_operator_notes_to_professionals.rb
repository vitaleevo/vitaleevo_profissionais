class AddOperatorNotesToProfessionals < ActiveRecord::Migration[8.1]
  def change
    add_column :professionals, :operator_notes, :text
  end
end
