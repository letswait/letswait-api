import ApiRoutes from './routes'
import FeedRoutes from './routes.feed'
import MatchRoutes from './routes.matches'
import ProfileRoutes from './routes.profile'
import UploadRoutes from './routes.upload'
import UserRoutes from './routes.user'
import DateRoutes from './routes.dates'
import AdminRoutes from './routes.admin'

export default {
  api: ApiRoutes,
  match: MatchRoutes,
  profile: ProfileRoutes,
  upload: UploadRoutes,
  feed: FeedRoutes,
  user: UserRoutes,
  date: DateRoutes,
  admin: AdminRoutes,
}
