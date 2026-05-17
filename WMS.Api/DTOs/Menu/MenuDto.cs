//namespace WMS.Api.DTOs.Menu
//{
//    public class MenuDto
//    {
//        public int MenuID { get; set; }          // FormID
//        public string MenuName { get; set; }     // MenuTitle
//        public string MenuPath { get; set; }     // FormName
//        public string Icon { get; set; }         // MenuIcon
//        public int? ParentID { get; set; }       // ParentPage
//        public int? MenuOrder { get; set; }
//        public List<MenuDto> Children { get; set; } = new();
//    }
//}
namespace WMS.Api.DTOs.Menu
{
    public class MenuDto
    {
        public int MenuID { get; set; }
        public string MenuName { get; set; }
        public string MenuPath { get; set; }
        public string Icon { get; set; }
        public string MenuCategory { get; set; }
        public int? ParentID { get; set; }
        public int? MenuOrder { get; set; }
        public List<MenuDto> Children { get; set; } = new();
    }
}