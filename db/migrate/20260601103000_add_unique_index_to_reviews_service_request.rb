class AddUniqueIndexToReviewsServiceRequest < ActiveRecord::Migration[8.1]
  def change
    remove_index :reviews, :service_request_id
    add_index :reviews, :service_request_id, unique: true
  end
end
