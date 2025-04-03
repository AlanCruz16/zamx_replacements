import {
    Fan,
    Clock,
    Truck,
    BadgeCheck,
} from 'lucide-react'

const features = [
    {
        icon: <Fan className="w-12 h-12 text-blue-500" />,
        title: "Original Parts",
        description: "Genuine ZIEHL-ABEGG spare parts ensuring optimal performance and reliability"
    },
    {
        icon: <Clock className="w-12 h-12 text-blue-500" />,
        title: "Quick Response",
        description: "Fast quotations and efficient processing of your spare part requests"
    },
    {
        icon: <Truck className="w-12 h-12 text-blue-500" />,
        title: "Global Delivery",
        description: "Worldwide shipping and logistics solutions for your requirements"
    },
    {
        icon: <BadgeCheck className="w-12 h-12 text-blue-500" />,
        title: "Quality Assured",
        description: "All parts meet strict quality standards and come with warranty"
    }
]

export function Features() {
    return (
        <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Why Choose Our Service?
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        We provide comprehensive solutions for all your spare parts needs
                    </p>
                </div>

                <div className="mt-12">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="relative group bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-500">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}