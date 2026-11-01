/**
 * Invoice Data Adapter
 * Converts PaymentOrder or Enrollment objects into unified invoice data structure
 */
export const adaptPaymentToInvoice = (payment) => {
    if (!payment) return null;

    const user = payment.userId || {};
    const courses = Array.isArray(payment.courseIds) ? payment.courseIds : [];

    const dateStr = payment.createdAt || payment.updatedAt || new Date();
    const dateObj = new Date(dateStr);
    const year = dateObj.getFullYear();
    const orderNum = payment.orderId || `AEC-ORD-${payment._id?.slice(-5).toUpperCase() || '00001'}`;
    const invoiceNum = payment.invoiceNumber || `INV-${year}-${(payment.orderId?.slice(-5) || payment._id?.slice(-5) || '00001').toUpperCase()}`;

    // Calculate totals
    const grandTotal = Number(payment.totalPaid ?? payment.amount ?? 0);
    const subtotal = Number(payment.subtotal ?? (payment.totalPaid ?? payment.amount ?? 0));
    const discountAmount = Number(payment.discountAmount ?? 0);
    const taxAmount = Number(payment.taxAmount ?? 0);

    const transactionRef = 
        payment.paymob?.transactionId || 
        payment.tabby?.paymentId || 
        payment.tamara?.checkoutId || 
        payment._id?.slice(-8).toUpperCase() ||
        'TXN-AEC';

    const frontendBase = typeof window !== 'undefined' ? window.location.origin : 'https://aectraining.com.sa';

    return {
        invoiceNumber: invoiceNum,
        orderNumber: orderNum,
        issueDate: dateObj,
        paymentStatus: payment.status || 'completed',
        student: {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'متدرب بأكاديمية AEC',
            email: user.email || '',
            phone: user.phone || '',
            phoneCode: user.phoneCode || ''
        },
        courses: courses.map(c => ({
            _id: c._id,
            title: c.title || 'دورة تدريبية',
            courseType: c.courseType || 'recorded',
            price: Number(c.price) || (courses.length > 0 ? subtotal / courses.length : subtotal),
            instructor: c.instructor ? {
                name: `${c.instructor.firstName || ''} ${c.instructor.lastName || ''}`.trim() || c.instructor.email
            } : null
        })),
        paymentMethod: payment.gateway || 'mada',
        transactionRef: `TXN-${transactionRef}`,
        subtotal,
        couponCode: payment.couponCode || null,
        discountAmount,
        taxAmount,
        grandTotal,
        verificationUrl: `${frontendBase}/verify-enrollment/${orderNum}`
    };
};

export const adaptEnrollmentToInvoice = (enrollment, currentUser = null) => {
    if (!enrollment) return null;

    const student = enrollment.student || currentUser || {};
    const course = enrollment.course || {
        _id: enrollment.courseId,
        title: enrollment.title,
        courseType: enrollment.courseType,
        price: enrollment.paymentAmount
    };

    const dateStr = enrollment.enrolledAt || enrollment.createdAt || new Date();
    const dateObj = new Date(dateStr);
    const year = dateObj.getFullYear();
    const serial = enrollment.serialNumber || enrollment._id?.slice(-5).toUpperCase() || '00001';
    const orderNum = enrollment.paymentId?.startsWith('admin-manual') 
        ? `AEC-ADM-${serial}`
        : enrollment.paymentId || `AEC-ORD-${serial}`;
    const invoiceNum = `INV-${year}-${serial}`;

    const paid = Number(enrollment.paymentAmount ?? 0);
    const subtotal = Number(course.price || paid);
    const discount = subtotal > paid ? subtotal - paid : 0;

    const frontendBase = typeof window !== 'undefined' ? window.location.origin : 'https://aectraining.com.sa';

    return {
        invoiceNumber: invoiceNum,
        orderNumber: orderNum,
        issueDate: dateObj,
        paymentStatus: enrollment.status === 'failed' ? 'failed' : 'completed',
        student: {
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'متدرب بأكاديمية AEC',
            email: student.email || '',
            phone: student.phone || '',
            phoneCode: student.phoneCode || ''
        },
        courses: [{
            _id: course._id,
            title: course.title || enrollment.title || 'دورة تدريبية معتمدة',
            courseType: course.courseType || enrollment.courseType || 'recorded',
            price: subtotal,
            instructor: course.instructor ? {
                name: `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || course.instructor.email
            } : null
        }],
        paymentMethod: enrollment.paymentId?.startsWith('admin-manual') ? 'manual' : 'mada',
        transactionRef: `TXN-${serial}`,
        subtotal,
        couponCode: null,
        discountAmount: discount,
        taxAmount: 0,
        grandTotal: paid,
        verificationUrl: `${frontendBase}/verify-enrollment/${enrollment.serialNumber || orderNum}`
    };
};
