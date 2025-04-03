import { Info } from 'lucide-react'

export function InformationSection() {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
                <Info className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold">How to Find Your Product Information</h2>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-3 text-gray-600">
                        <p>
                            The <span className="text-amber-500 font-bold">part number</span> of a ZIEHL-ABEGG product
                            is necessary to identify the correct replacement. It's typically a 6-digit number that starts
                            with 1 or 2.
                        </p>

                        <p>
                            The <span className="text-blue-500 font-bold">description</span> of the fan type is needed
                            to confirm that the supplied part number matches the design of the requested unit.
                        </p>

                        <p>
                            If the part number is not available, the <span className="text-pink-500 font-bold">serial number</span> will
                            help us identify the unit. The serial number is typically 8 digits long and is also engraved
                            on the motor stator.
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Reference Image:</p>
                    <img
                        src="/plate-example.jpg"
                        alt="Data plate example"
                        className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
                    />
                </div>
            </div>
        </div>
    )
}