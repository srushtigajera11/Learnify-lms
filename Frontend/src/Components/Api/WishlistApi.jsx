import axiosInstance from '../../utils/axiosInstance';

export const addToWishlist = async (courseId) => {
  return axiosInstance.post(`/wishlist/add/${courseId}`);
};

export const removeFromWishlist = async (courseId) => {
  return axiosInstance.delete(`/wishlist/remove/${courseId}`);
};

export const fetchWishlist = async () => {
  const res = await axiosInstance.get(`/wishlist`);
  return res.data.wishlist;
};
