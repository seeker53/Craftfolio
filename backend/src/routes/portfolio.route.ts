import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { validatePortfolioOwnership } from '../middlewares/verifyPortfolioOwner';
import {
    getAllPortfolios,
    createPortfolio,
    togglePortfolioVisibility,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio,
    getPortfolioCapUsage,
    getPortfolioLink
} from '../controllers/portfolio.controller';

const portfolioRouter = Router();

portfolioRouter.route("/").get(verifyJWT, getAllPortfolios);

portfolioRouter.route("/").post(verifyJWT, createPortfolio);

portfolioRouter.route("/cap-usage").get(verifyJWT, getPortfolioCapUsage);

portfolioRouter.route("/:portfolioId/visibility").patch(verifyJWT, validatePortfolioOwnership, togglePortfolioVisibility);

portfolioRouter.route("/link/:portfolioId").get(verifyJWT, validatePortfolioOwnership, getPortfolioLink);

portfolioRouter.route("/:portfolioId").get(verifyJWT, validatePortfolioOwnership, getPortfolioById);

portfolioRouter.route("/:portfolioId").patch(verifyJWT, validatePortfolioOwnership, updatePortfolio);

portfolioRouter.route("/:portfolioId").delete(verifyJWT, validatePortfolioOwnership, deletePortfolio);

export default portfolioRouter;

