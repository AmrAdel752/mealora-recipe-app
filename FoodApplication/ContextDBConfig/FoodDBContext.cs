using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using FoodApplication.Models;

namespace FoodApplication.ContextDBConfig
{
    public class FoodApplicationDBContext : IdentityDbContext<AppliacationUser>
    {
        public FoodApplicationDBContext()
        {
        } 
        public FoodApplicationDBContext(DbContextOptions<FoodApplicationDBContext> options):base(options)
        {

        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
        }
        public DbSet<Order> Orders { get; set; } 
        public DbSet<Cart> Carts { get; set; } 
    }
}
