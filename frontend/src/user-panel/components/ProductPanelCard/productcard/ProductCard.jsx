const ProductCard = ({ thumbnail, title, sellingPrice, offerPrice }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center">
      <img src={thumbnail} alt={title} className="w-[300px] h-[300px] object-cover rounded mb-3" />
      <h3 className="text-md font-semibold">{title}</h3>
      <div className="flex items-center gap-2 mt-1">
        {offerPrice ? (
          <>
            <span className="text-sm text-gray-500 line-through">${sellingPrice}</span>
            <span className="text-md font-bold text-red-600">${offerPrice}</span>
          </>
        ) : (
          <span className="text-md font-bold text-black">${sellingPrice}</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;