export const mockRunners = [
  {
    _id: "RUN001",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+234 801 234 5678",
    createdAt: "2023-10-01",
    runnerStatus: "pending",
    verificationDocuments: {
      nin: { status: "not_submitted" },
      driverLicense: { status: "approved", documentPath: "https://via.placeholder.com/600x400?text=NIN+Front" },
    },
    biometricVerification: { status: "pending_review", selfieImage: "https://via.placeholder.com/400x400?text=Selfie" }
  },
  {
    _id: "RUN002",
    firstName: "Sarah",
    lastName: "Okon",
    email: "sarah.o@example.com",
    phone: "+234 902 333 4444",
    createdAt: "2023-10-05",
    runnerStatus: "pending",
    verificationDocuments: {
      nin: { status: "approved", documentPath: "https://via.placeholder.com/600x400" }
    },
    biometricVerification: { status: "approved", selfieImage: "https://via.placeholder.com/400x400" }
  }
];