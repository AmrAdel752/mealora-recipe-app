using Microsoft.AspNetCore.Mvc;

namespace FoodApplication.Controllers
{
    public class FavoritesController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
