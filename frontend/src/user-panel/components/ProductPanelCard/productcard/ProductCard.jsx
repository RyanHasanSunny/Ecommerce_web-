const ProductCard = ({ image, title, price, offerPrice }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center">
      <img src={image} alt={title} className="w-full h-48 object-cover rounded mb-3" />
      <h3 className="text-md font-semibold">{title}</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm text-gray-500 line-through">${price}</span>
        <span className="text-md font-bold text-red-600">${offerPrice}</span>
      </div>
    </div>
  );
};
export default ProductCard;
