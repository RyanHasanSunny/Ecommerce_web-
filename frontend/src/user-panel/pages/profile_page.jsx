import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getUserProfile,
  updatePassword,
  getUserAddresses,
  addAddress,
  getUserProducts
} from '../api/api';
import ProductCard from '../components/ProductPanelCard/productcard/ProductCard';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [products, setProducts] = useState([]);
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' });
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getUserProfile();
        setProfile(profileData);
        const addressData = await getUserAddresses();
        setAddresses(addressData);
        const userProducts = await getUserProducts();
        setProducts(userProducts);
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
    };
    fetchData();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      alert('New password and confirmation do not match');
      return;
    }
    try {
      await updatePassword(passwords.current, passwords.newPassword);
      alert('Password updated successfully');
      setPasswords({ current: '', newPassword: '', confirm: '' });
    } catch (err) {
      alert('Failed to update password');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const added = await addAddress({ address: newAddress });
      setAddresses([...addresses, added]);
      setNewAddress('');
    } catch (err) {
      alert('Failed to add address');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>

      {profile && (
        <div className="mb-8 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Profile Information</h2>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>User ID:</strong> {profile.id}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      )}

      <div className="mb-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Current Password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            required
          />
          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            required
          />
          <input
            type="password"
            className="w-full border p-2 rounded"
            placeholder="Confirm New Password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Update Password
          </button>
        </form>
      </div>

      <div className="mb-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Addresses</h2>
        <ul className="list-disc pl-5 mb-4">
          {addresses.map((addr) => (
            <li key={addr.id}>{addr.address}</li>
          ))}
        </ul>
        <form onSubmit={handleAddAddress} className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border p-2 rounded"
            placeholder="New Address"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            required
          />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Add Address
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">My Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              thumbnail={product.thumbnail}
              title={product.title}
              sellingPrice={product.sellingPrice}
              offerPrice={product.offerPrice}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
