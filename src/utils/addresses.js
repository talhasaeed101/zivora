export const mapAddressForUi = (address) => {
  if (!address) {
    return null;
  }

  return {
    id: address._id,
    name: address.name,
    email: address.email,
    phone: address.phone,
    province: address.province,
    city: address.city,
    street: address.address,
    postalCode: address.postalCode,
    isDefault: Boolean(address.isDefault),
  };
};

export const mapAddressForApi = (form) => ({
  name: form.name,
  email: form.email,
  phone: form.phone,
  province: form.province,
  city: form.city,
  address: form.street,
  postalCode: form.postalCode,
});

export const EMPTY_ADDRESS_FORM = {
  name: '',
  email: '',
  phone: '',
  province: '',
  city: '',
  street: '',
  postalCode: '',
};
