import { ContactForm } from "@/components/ContactForm"

const ContactoPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <ContactForm />
        {/* pb-8 can be added here if needed */}
      </div>
    </div>
  )
}

export default ContactoPage
