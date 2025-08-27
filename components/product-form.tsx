"use client"

import type React from "react"
import { useState } from "react"
import { Form, Input, Label, Button } from "react-bootstrap"

const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    condition: "",
    pricePesos: 0,
    priceUSD: 0,
    specifications: "",
    images: [],
    isFeatured: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log(formData)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          name="description"
          type="text"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Categoría</Label>
        <Input
          id="category"
          name="category"
          type="text"
          value={formData.category}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="condition">Condición</Label>
        <Input
          id="condition"
          name="condition"
          type="text"
          value={formData.condition}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="pricePesos">Precio en Pesos</Label>
        <Input
          id="pricePesos"
          name="pricePesos"
          type="number"
          min="0"
          value={formData.pricePesos}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="priceUSD">Precio en USD</Label>
        <Input
          id="priceUSD"
          name="priceUSD"
          type="number"
          min="0"
          value={formData.priceUSD}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="specifications">Especificaciones Técnicas</Label>
        <Input
          id="specifications"
          name="specifications"
          type="text"
          value={formData.specifications}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="images">Imágenes</Label>
        <Input
          id="images"
          name="images"
          type="file"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            setFormData({
              ...formData,
              images: files,
            })
          }}
          required
        />
      </div>
      <div>
        <Label htmlFor="isFeatured">Destacado</Label>
        <Input
          id="isFeatured"
          name="isFeatured"
          type="checkbox"
          checked={formData.isFeatured}
          onChange={(e) => {
            setFormData({
              ...formData,
              isFeatured: e.target.checked,
            })
          }}
        />
      </div>
      <Button type="submit">Guardar Producto</Button>
    </Form>
  )
}

export default ProductForm
