import { FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceFormDownload = ({ serviceName, fileName = "formulaire-officiel.pdf" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-2xl group transition-all hover:bg-white hover:shadow-xl hover:border-blue-200"
        >
            <div className="bg-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-[#3b5998]" />
            </div>

            <div className="flex-1 text-center sm:text-left">
                <h4 className="font-black text-[#1a1a1a] uppercase text-sm tracking-tight">
                    Formulaire de {serviceName}
                </h4>
                <p className="text-gray-500 text-xs font-bold leading-relaxed">
                    Téléchargez le fichier PDF éditable pour préparer votre dossier à l'avance.
                </p>
            </div>

            <a
                href={`/forms/${fileName}`}
                download={fileName}
                className="flex items-center gap-2 bg-white text-[#3b5998] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest border-2 border-[#3b5998] hover:bg-[#3b5998] hover:text-white transition-all shadow-sm active:scale-95 shrink-0"
            >
                <Download className="h-4 w-4" />
                Télécharger
            </a>
        </motion.div>
    );
};

export default ServiceFormDownload;
