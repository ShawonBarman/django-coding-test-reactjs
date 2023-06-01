import React, { useState } from 'react';
import axios from 'axios';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

// Retrieve the CSRF token from the cookies
const csrftoken = getCookie('csrftoken');

// Helper function to get the value of a cookie by name
function getCookie(name) {
  const cookieValue = document.cookie.match('(^|;)\\s*' + name + '=([^;]+)');
  return cookieValue ? cookieValue.pop() : '';
}

// Add the CSRF token to Axios requests
axios.defaults.headers.common['X-CSRFToken'] = csrftoken;

const CreateProduct = (props) => {
  const [productData, setProductData] = useState({
    productName: '',
    productSKU: '',
    description: ''
  });

  const [variantData, setVariantData] = useState([]);

  // handle input change for product fields
  const handleProductInputChange = (event) => {
    const { name, value } = event.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // handle input change for variant fields
  const handleVariantInputChange = (event, index) => {
    const { name, value } = event.target;
    const updatedVariants = [...variantData];
    updatedVariants[index][name] = value;
    setVariantData(updatedVariants);
  };

  // handle add variant
  const handleAddVariant = () => {
    setVariantData((prevVariants) => [
      ...prevVariants,
      { option: '', tags: [] }
    ]);
  };

  // handle remove variant
  const handleRemoveVariant = (index) => {
    setVariantData((prevVariants) => {
      const updatedVariants = [...prevVariants];
      updatedVariants.splice(index, 1);
      return updatedVariants;
    });
  };

  // Save product and variants
  const saveProduct = (event) => {
    event.preventDefault();

    // Prepare product data
    const productPayload = {
      name: productData.productName,
      sku: productData.productSKU,
      description: productData.description
    };

    // Make API call to save the product
    axios.post('api/saveProduct', productPayload)
      .then((response) => {
        const productId = response.data.id;

        // Prepare variant data
        const variantPayload = variantData.map((variant) => {
          return {
            option: variant.option,
            tags: variant.tags,
            productId: productId
          };
        });

        // Make API call to save variants
        axios.post('api/saveVariant', variantPayload)
          .then((response) => {
            // Variant data saved successfully
            console.log('Variants saved:', response.data);
          })
          .catch((error) => {
            // Error saving variants
            console.error('Error saving variants:', error);
          });
      })
      .catch((error) => {
        // Error saving product
        console.error('Error saving product:', error);
      });

    // Clear the form fields
    setProductData({
      productName: '',
      productSKU: '',
      description: ''
    });
    setVariantData([]);
  };

  return (
    <div>
      <form onSubmit={saveProduct}>
        <div className="form-group">
          <label htmlFor="productName">Product Name</label>
          <input
            type="text"
            id="productName"
            name="productName"
            value={productData.productName}
            onChange={handleProductInputChange}
            className="form-control"
            placeholder="Product Name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="productSKU">Product SKU</label>
          <input
            type="text"
            id="productSKU"
            name="productSKU"
            value={productData.productSKU}
            onChange={handleProductInputChange}
            className="form-control"
            placeholder="Product SKU"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={productData.description}
            onChange={handleProductInputChange}
            className="form-control"
            placeholder="Description"
            rows="4"
          ></textarea>
        </div>

        <div className="card shadow mb-4">
          <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 className="m-0 font-weight-bold text-primary">Variants</h6>
        </div>
        <div className="card-body">
          {variantData.map((variant, index) => (
            <div className="row" key={index}>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="">Option</label>
                  <select
                    className="form-control"
                    name="option"
                    value={variant.option}
                    onChange={(event) => handleVariantInputChange(event, index)}
                  >
                    {variants.map((variantOption) => (
                      <option key={variantOption.id} value={variantOption.id}>{variantOption.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-8">
                <div className="form-group">
                  {variantData.length > 1 && (
                    <label
                      htmlFor=""
                      className="float-right text-primary"
                      style={{ marginTop: "-30px" }}
                      onClick={() => handleRemoveVariant(index)}
                    >
                      remove
                    </label>
                  )}

                  <section style={{ marginTop: "30px" }}>
                    <TagsInput
                      value={variant.tags}
                      onChange={(value) =>
                        handleVariantInputChange(
                          { target: { name: "tags", value } },
                          index
                        )
                      }
                    />
                  </section>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="card-footer">
          {variantData.length !== 3 && (
            <button
              className="btn btn-primary"
              onClick={handleAddVariant}
            >
              Add another option
            </button>
          )}
        </div>
      </div>

      <div className="card-header text-uppercase">Preview</div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <td>Variant</td>
                <td>Price</td>
                <td>Stock</td>
              </tr>
            </thead>
            <tbody>
              {/* Render your variant prices here */}
            </tbody>
          </table>
        </div>
      </div>

      <button type="submit" className="btn btn-lg btn-primary">Save</button>
      <button type="button" className="btn btn-secondary btn-lg">Cancel</button>
    </form>
  </div>
  );
};

export default CreateProduct;