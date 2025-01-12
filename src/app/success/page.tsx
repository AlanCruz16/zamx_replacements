// src/app/success/page.tsx

export default function SuccessPage() {
    return (
        // Container with full height and centered content
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {/* White card with shadow */}
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                {/* Success message */}
                <h1 className="text-2xl font-bold text-green-600 mb-4">
                    Request Submitted Successfully!
                </h1>

                {/* Additional information */}
                <p className="text-gray-600 mb-6">
                    Thank you for your quotation request. We have received your information
                    and will get back to you shortly.
                </p>

                {/* Return home link styled as a button */}
                <a
                    href="/"
                    className="inline-block bg-primary text-primary-foreground px-6 py-2 
                             rounded-md hover:bg-primary/90 transition-colors"
                >
                    Return Home
                </a>
            </div>
        </div>
    );
}