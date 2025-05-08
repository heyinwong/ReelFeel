class Staff:
#{
  def __init__(self, staff_number, first_name, last_name, email):
  #{
    self.staff_number = staff_number
    self.first_name = first_name
    self.last_name = last_name
    self.email = email
  #} 
  
  def print_details(self, width):
      print("{}".format('-'*40))
      print("| {0} {1}".format(self.first_name,self.last_name),end="")
      remain_width = self.width - 4 - len(self.first_name)-len(self.last_name)
      print("{}|".format(" "*remain_width))
      print("| {}".format(self.email),end="")
      remain_width = self.width - 3 - len(self.email)
      print("{}|".format(" "*remain_width))